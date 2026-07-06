import { Browser, BrowserContext, Page, chromium } from "playwright";

/**
 * Page-object wrapper around the ENERGY STAR Portfolio Manager test web UI
 * (https://portfoliomanager.energystar.gov/pmtest).
 *
 * The web services API is receive-only for connections and shares, so the
 * peer account must initiate them through this UI. Flows follow EPA's
 * "Connection and Sharing Guidance for Providers" and "How to Share
 * Properties" documents — see plans/connection-sharing-e2e-tests.md.
 *
 * Locators were validated against the live pmtest UI on 2026-07-04 using
 * test/e2e/probe.ts — rerun that tool to revalidate when the ESPM UI drifts.
 * Keep every selector in this file so drift is a single-file fix.
 */

export const DEFAULT_WEB_UI_URL =
  "https://portfoliomanager.energystar.gov/pmtest";

export type ExchangeDataAccessLevel = "Full Access" | "Read Only Access";

export interface IEspmWebUiOptions {
  baseUrl?: string;
  headless?: boolean;
  /** Directory to write a Playwright trace into on close(). */
  traceDir?: string;
  /** Per-action timeout in ms. The pmtest environment can be slow. */
  actionTimeoutMs?: number;
}

export class EspmWebUi {
  readonly baseUrl: string;
  private readonly headless: boolean;
  private readonly traceDir?: string;
  private readonly actionTimeoutMs: number;
  private browser?: Browser;
  private context?: BrowserContext;
  private _page?: Page;

  constructor(options: IEspmWebUiOptions = {}) {
    this.baseUrl = (options.baseUrl || DEFAULT_WEB_UI_URL).replace(/\/$/, "");
    this.headless = options.headless ?? true;
    this.traceDir = options.traceDir;
    this.actionTimeoutMs = options.actionTimeoutMs ?? 30000;
  }

  get page(): Page {
    if (!this._page) {
      throw new Error("EspmWebUi not launched. Call launch() first.");
    }
    return this._page;
  }

  async launch(): Promise<void> {
    this.browser = await chromium.launch({ headless: this.headless });
    this.context = await this.browser.newContext();
    this.context.setDefaultTimeout(this.actionTimeoutMs);
    // pmtest pages regularly stall on slow subresources; navigation waits for
    // domcontentloaded (see goto below) but still needs generous headroom.
    this.context.setDefaultNavigationTimeout(this.actionTimeoutMs * 2);
    if (this.traceDir) {
      await this.context.tracing.start({ screenshots: true, snapshots: true });
    }
    this._page = await this.context.newPage();
    // ESPM uses native confirm() dialogs (e.g. re-sharing when the contact
    // already had access). Playwright dismisses dialogs by default, which
    // silently cancels the action — accept them instead.
    this._page.on("dialog", (dialog) => void dialog.accept());
  }

  /**
   * Stops tracing (writing the trace when a name is given) and closes the
   * browser. Safe to call multiple times.
   */
  async close(traceName?: string): Promise<void> {
    if (this.context && this.traceDir) {
      try {
        await this.context.tracing.stop(
          traceName
            ? { path: `${this.traceDir}/${traceName}.zip` }
            : undefined
        );
      } catch {
        // Tracing may already be stopped; never mask the test failure.
      }
    }
    await this.browser?.close();
    this.browser = undefined;
    this.context = undefined;
    this._page = undefined;
  }

  /**
   * Navigates waiting only for domcontentloaded: pmtest pages routinely
   * stall on slow subresources, so waiting for the full load event times out
   * even though the page is usable.
   */
  private async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  /** Logs in to the Portfolio Manager web UI. */
  async login(username: string, password: string): Promise<void> {
    const page = this.page;
    await this.goto(`${this.baseUrl}/login`);
    await page
      .locator('input[name="username"], #username')
      .first()
      .fill(username);
    await page
      .locator('input[name="password"], #password')
      .first()
      .fill(password);
    await page
      .getByRole("button", { name: /sign in|log ?in/i })
      .or(page.locator('input[type="submit"]'))
      .first()
      .click();
    // MyPortfolio is the landing tab for an authenticated session.
    await page
      .getByRole("link", { name: /myportfolio/i })
      .first()
      .waitFor({ state: "visible" });
  }

  /**
   * Sends a connection request to a provider account.
   * UI path: Contacts -> Add New Contacts/Connections -> search by username
   * -> Connect -> (accept Terms of Use if configured) -> Send Connection
   * Request.
   */
  async sendConnectionRequest(providerUsername: string): Promise<void> {
    const page = this.page;
    await this.goto(`${this.baseUrl}/contact/list`);
    await page
      .getByRole("button", { name: /add new contacts/i })
      .first()
      .click();

    // "Connect with an Existing User for Sharing" search form.
    await page.locator("#searchContactUsername").fill(providerUsername);
    await page.getByRole("button", { name: /^search$/i }).first().click();

    // Connect from the search-result row for the provider account.
    const resultRow = page
      .locator("tr", { hasText: providerUsername })
      .or(page.locator("li", { hasText: providerUsername }));
    await resultRow
      .getByRole("button", { name: /^connect$/i })
      .or(resultRow.getByRole("link", { name: /^connect$/i }))
      .first()
      .click();

    // Lands on /dataexchange/sendConnectionRequest. The Terms of Use
    // agreement checkbox only renders when the provider configured terms.
    const agreement = page.locator('input[id^="agreement-checkbox"]');
    if ((await agreement.count()) && (await agreement.first().isVisible())) {
      await agreement.first().check();
    }
    await page
      .getByRole("button", { name: /send connection request/i })
      .first()
      .click();
    await page.waitForLoadState("domcontentloaded");
  }

  /**
   * Shares properties with a connected web services provider at the
   * Exchange Data level.
   * UI path: Sharing -> Set Up Web Services/Data Exchange -> select provider
   * -> Select Properties -> Bulk Sharing (Exchange Data Full/Read Only
   * Access) -> Authorize Exchange.
   */
  async setupDataExchangeShare(options: {
    providerUsername: string;
    propertyNames: string[];
    accessLevel: ExchangeDataAccessLevel;
  }): Promise<void> {
    const page = this.page;
    await this.goto(`${this.baseUrl}/sharing`);
    await page
      .getByRole("link", {
        name: /set up web services|share .*data exchange|exchanging data/i,
      })
      .first()
      .click();

    // 1. Select Web Services Provider (Account) — dropdown of connections.
    // Option labels look like "Org Name (username)", so resolve the option
    // whose text contains the username instead of matching the label exactly.
    const providerSelect = page.locator("select").first();
    const providerOption = providerSelect
      .locator("option", { hasText: options.providerUsername })
      .first();
    try {
      await providerOption.waitFor({ state: "attached" });
    } catch {
      throw new Error(
        `No connected web services provider option matching '${options.providerUsername}' — is the connection accepted?`
      );
    }
    await providerSelect.selectOption(
      (await providerOption.getAttribute("value")) ?? {
        label: (await providerOption.innerText()).trim(),
      }
    );

    // 2. Select Properties — opens the Angular picker dialog.
    await page.locator("#buttonSelectProperties").click();
    const dialog = page.locator("#modalDialogSelectProperties");
    await dialog.waitFor({ state: "visible" });
    for (const propertyName of options.propertyNames) {
      await dialog
        .locator("#modalDialogSelectPropertiesTable tbody tr", {
          hasText: propertyName,
        })
        .locator('input[type="checkbox"]')
        .first()
        .check();
    }
    await dialog
      .getByText(/apply selection/i)
      .first()
      .click();
    await dialog.waitFor({ state: "hidden" });

    // 3. Choose Permissions — bulk exchange-data access for everything.
    await page.locator('input[name="bulk"][value="yes"]').check();
    const accessValue =
      options.accessLevel === "Full Access" ? "FULL_ACCESS" : "READ_ONLY";
    await page
      .locator(`input[name="accessLevel"][value="${accessValue}"]`)
      .check();

    // 4. Send the sharing request. The button label flips between
    // "Authorize Exchange" (bulk) and "Set Permissions" (personalized).
    // The page submits via XHR to /wsBulkSharing/authorizeExchange.json and
    // swallows failures silently (its error handler just stops the spinner),
    // so verify the actual response instead of the DOM. The endpoint has been
    // observed taking minutes before answering when the test environment is
    // degraded — hence the generous timeout.
    const authorizeResponse = page
      .waitForResponse(
        (r) => r.url().includes("/wsBulkSharing/authorizeExchange.json"),
        { timeout: 180000 }
      )
      .catch(() => undefined);
    await page
      .locator("button", { hasText: /authorize exchange/i })
      .first()
      .click();
    const response = await authorizeResponse;
    if (!response) {
      throw new Error(
        "No response from wsBulkSharing/authorizeExchange.json within 180s — " +
          "the ESPM test environment is likely degraded."
      );
    }
    if (response.status() !== 200) {
      throw new Error(
        `wsBulkSharing/authorizeExchange.json returned HTTP ${response.status()} — ` +
          "ESPM test environment error while creating the share request."
      );
    }
  }
}
