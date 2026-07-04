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
 * NOTE: Locators are written from EPA's documentation of the UI (button and
 * link labels) and still need a validation pass against the live pmtest UI
 * (plan spike item). Keep every selector in this file so drift is a
 * single-file fix.
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
    if (this.traceDir) {
      await this.context.tracing.start({ screenshots: true, snapshots: true });
    }
    this._page = await this.context.newPage();
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

  /** Logs in to the Portfolio Manager web UI. */
  async login(username: string, password: string): Promise<void> {
    const page = this.page;
    await page.goto(`${this.baseUrl}/login`);
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
    await page.goto(`${this.baseUrl}/contacts`);
    await page
      .getByRole("link", { name: /add (new )?contacts?/i })
      .or(page.getByRole("button", { name: /add (new )?contacts?/i }))
      .first()
      .click();

    await page
      .locator('input[name*="username" i], input[id*="username" i]')
      .first()
      .fill(providerUsername);
    await page.getByRole("button", { name: /search/i }).first().click();

    // Connect from the search-result row for the provider account.
    const resultRow = page
      .locator("tr", { hasText: providerUsername })
      .or(page.locator("li", { hasText: providerUsername }));
    await resultRow
      .getByRole("button", { name: /^connect$/i })
      .or(resultRow.getByRole("link", { name: /^connect$/i }))
      .first()
      .click();

    // Providers may configure Terms of Use that must be acknowledged.
    const agreement = page.locator('input[type="checkbox"]');
    if (await agreement.count()) {
      await agreement.first().check();
    }
    await page
      .getByRole("button", { name: /send connection request/i })
      .first()
      .click();
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
    await page.goto(`${this.baseUrl}/sharing`);
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
    const providerOption = await providerSelect
      .locator("option", { hasText: options.providerUsername })
      .first()
      .getAttribute("value");
    if (providerOption === null) {
      throw new Error(
        `No connected web services provider option matching '${options.providerUsername}'`
      );
    }
    await providerSelect.selectOption(providerOption);

    // 2. Select Properties — opens a picker dialog.
    await page
      .getByRole("button", { name: /select properties/i })
      .or(page.getByRole("link", { name: /select properties/i }))
      .first()
      .click();
    for (const propertyName of options.propertyNames) {
      await page
        .locator("tr", { hasText: propertyName })
        .locator('input[type="checkbox"]')
        .first()
        .check();
    }
    await page
      .getByRole("button", { name: /apply selection/i })
      .first()
      .click();

    // 3. Choose Permissions — bulk exchange-data access for everything.
    await page
      .getByText(
        new RegExp(`exchange data ${options.accessLevel}`.replace(/ /g, "\\s+"), "i")
      )
      .first()
      .click();

    // 4. Send the sharing request.
    await page
      .getByRole("button", { name: /authorize exchange/i })
      .first()
      .click();
  }
}
