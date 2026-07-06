/**
 * Selector-maintenance probe for the pmtest web UI. Logs in and dumps
 * link/form structure for the flow step named on the CLI, so EspmWebUi
 * locators can be validated without guessing.
 *
 *   npx tsx test/e2e/probe.ts <target>
 *
 * Targets (peer account unless noted):
 *   home              landing page after login
 *   contacts          contact book
 *   add               contact book -> Add Contact form
 *   connect           search for the provider, stop on the request page
 *   sendconnect       actually send a connection request to the provider
 *   sharing           Sharing tab
 *   wsshare           accept pending connection as provider (SDK), then dump
 *                     the data-exchange share flow incl. property picker
 *   doshare           perform the full data-exchange share flow (requires a
 *                     live connection) with viewmodel/network instrumentation;
 *                     E2E_PROPERTY_NAME overrides the property to share
 *   provider-settings account settings as the PROVIDER account; add
 *                     --make-searchable to enable username searchability
 *
 * See also test/e2e/state.ts to dump the provider-side pending/connected
 * state via the SDK.
 */
import { EspmWebUi } from "./EspmWebUi.js";

const target = process.argv[2] || "home";
// Most targets act as the peer; account-settings targets act as the provider.
const asProvider = target.startsWith("provider-");
const username =
  (asProvider ? process.env.PM_USERNAME : process.env.PM_USERNAME2) || "";
const password =
  (asProvider ? process.env.PM_PASSWORD : process.env.PM_PASSWORD2) || "";
if (!username || !password) throw new Error("Set PM_USERNAME(2)/PM_PASSWORD(2)");

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} for the '${target}' target`);
  return value;
}

const ui = new EspmWebUi({
  baseUrl: process.env.PM_WEB_ENDPOINT,
  headless: process.env.E2E_HEADLESS !== "false",
});

async function dump(label: string) {
  const page = ui.page;
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  console.log(`\n=== ${label} @ ${page.url()}`);
  console.log(`title: ${await page.title()}`);
  console.log(
    "frames:",
    JSON.stringify(page.frames().map((f) => f.url()))
  );
  const bodyText = await page
    .locator("body")
    .innerText()
    .catch(() => "");
  console.log("body text:", bodyText.replace(/\s+/g, " ").slice(0, 6000));
  const links = await page
    .locator("a")
    .evaluateAll((els) =>
      els
        .map((e) => ({
          text: (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 70),
          href: (e.getAttribute("href") || "").slice(0, 90),
        }))
        .filter((l) => l.text)
    );
  console.log("links:", JSON.stringify(links.slice(0, 120), null, 1));
  const inputs = await page
    .locator("input, select, button")
    .evaluateAll((els) =>
      els.map((e) => ({
        tag: e.tagName.toLowerCase(),
        type: e.getAttribute("type"),
        name: e.getAttribute("name"),
        id: e.getAttribute("id"),
        value: (e.getAttribute("value") || "").slice(0, 40),
        text: (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
      }))
    );
  console.log("controls:", JSON.stringify(inputs.slice(0, 80), null, 1));
}

try {
  await ui.launch();
  await ui.login(username, password);
  await dump("after login");

  const page = ui.page;
  if (target === "contacts" || target === "add") {
    await page.getByRole("link", { name: /contacts/i }).first().click();
    await page.waitForLoadState("domcontentloaded");
    await dump("contacts");
    if (target === "add") {
      const addCandidates = await page.evaluate(() =>
        Array.from(document.querySelectorAll("*"))
          .filter((e) => {
            const direct = Array.from(e.childNodes)
              .filter((n) => n.nodeType === 3)
              .map((n) => n.textContent || "")
              .join(" ");
            const value = (e as HTMLInputElement).value || "";
            return /add new contacts/i.test(direct + " " + value);
          })
          .map((e) => e.outerHTML.slice(0, 400))
      );
      console.log("add candidates:", JSON.stringify(addCandidates, null, 1));
      await page.getByText(/add new contacts/i).first().click();
      await page.waitForLoadState("domcontentloaded");
      await dump("add contact");
    }
  } else if (target === "connect") {
    const providerUsername = requireEnv("PM_USERNAME");
    await page.goto(`${ui.baseUrl}/contact/list`, {
      waitUntil: "domcontentloaded",
    });
    await page
      .getByRole("button", { name: /add new contacts/i })
      .first()
      .click();
    await page.locator("#searchContactUsername").fill(providerUsername);
    console.log(
      "username field value after fill:",
      await page.locator("#searchContactUsername").inputValue()
    );
    await page.getByRole("button", { name: /^search$/i }).first().click();
    await dump("search results");
    await page
      .getByRole("button", { name: /^connect$/i })
      .or(page.getByRole("link", { name: /^connect$/i }))
      .first()
      .click();
    await dump("connection request page");
  } else if (target === "doshare") {
    // Reproduce the full share flow with dumps after each phase. Assumes a
    // live connection (run sendconnect + wsshare first, or the e2e step 1).
    page.on("response", (r) => {
      if (r.url().includes("portfoliomanager") && r.status() >= 400) {
        console.log(`HTTP ${r.status()} ${r.request().method()} ${r.url()}`);
      }
    });
    page.on("request", (r) => {
      if (r.url().includes("wsBulkSharing")) {
        console.log(`REQ ${r.method()} ${r.url()}`);
      }
    });
    page.on("requestfailed", (r) => {
      console.log(
        `REQFAILED ${r.method()} ${r.url().slice(0, 140)} => ${r.failure()?.errorText}`
      );
    });
    page.on("requestfinished", (r) => {
      if (r.url().includes("authorizeExchange")) {
        console.log(`REQFINISHED ${r.method()} ${r.url()}`);
      }
    });
    await page.goto(`${ui.baseUrl}/sharing`, { waitUntil: "domcontentloaded" });
    await page
      .getByRole("link", {
        name: /set up web services|share .*data exchange|exchanging data/i,
      })
      .first()
      .click();
    await page.waitForLoadState("domcontentloaded");
    const providerSelect = page.locator("select").first();
    const opt = providerSelect
      .locator("option", { hasText: requireEnv("PM_USERNAME") })
      .first();
    await opt.waitFor({ state: "attached" });
    await providerSelect.selectOption((await opt.getAttribute("value")) || "");
    await page.locator("#buttonSelectProperties").click();
    const dialog = page.locator("#modalDialogSelectProperties");
    await dialog.waitFor({ state: "visible" });
    await dialog
      .locator("#modalDialogSelectPropertiesTable tbody tr", {
        hasText: process.env.E2E_PROPERTY_NAME || "E2E Share Fixture Property",
      })
      .locator('input[type="checkbox"]')
      .first()
      .check();
    await dialog.getByText(/apply selection/i).first().click();
    await dialog.waitFor({ state: "hidden" });
    await page.locator('input[name="bulk"][value="yes"]').click();
    await page.locator('input[name="accessLevel"][value="FULL_ACCESS"]').click();
    const radioState = () =>
      page.evaluate(() => ({
        bulk: (
          document.querySelector('input[name="bulk"]:checked') as
            | HTMLInputElement
            | null
        )?.value,
        accessLevel: (
          document.querySelector('input[name="accessLevel"]:checked') as
            | HTMLInputElement
            | null
        )?.value,
        accessLevelBindings: Array.from(
          document.querySelectorAll('input[name="accessLevel"]')
        ).map((e) => e.getAttribute("data-bind")),
        errors: Array.from(
          document.querySelectorAll(
            '[class*="error" i], [class*="alert" i], [class*="notice" i]'
          )
        )
          .filter((e) => (e as HTMLElement).offsetParent !== null)
          .map((e) => (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 200)),
        koLoading: (() => {
          const w = window as unknown as {
            ko?: { dataFor: (e: Element | null) => { loading?: () => boolean } };
          };
          try {
            return w.ko
              ?.dataFor(document.querySelector("#choose-permissions-form"))
              ?.loading?.();
          } catch {
            return "ko-error";
          }
        })(),
      }));
    console.log("radio state before:", JSON.stringify(await radioState()));
    const handlerSource = await page.evaluate(async () => {
      const out: string[] = [];
      const srcs = Array.from(document.scripts)
        .map((s) => s.src)
        .filter(Boolean);
      for (const src of srcs) {
        try {
          const text = await fetch(src).then((r) => r.text());
          let i = text.indexOf("authorizeExchange");
          while (i >= 0 && out.length < 4) {
            out.push(
              `--- ${src}\n` + text.slice(Math.max(0, i - 300), i + 2200)
            );
            i = text.indexOf("authorizeExchange", i + 1);
          }
        } catch {
          // cross-origin or fetch failure — skip
        }
      }
      return out.join("\n\n");
    });
    console.log("authorizeExchange source:\n", handlerSource.slice(0, 9000));
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning") {
        console.log(`CONSOLE ${m.type()}: ${m.text().slice(0, 300)}`);
      }
    });
    page.on("pageerror", (e) => console.log(`PAGEERROR: ${String(e).slice(0, 300)}`));
    await dump("before authorize");
    const authorizeButtons = await page.evaluate(() =>
      Array.from(document.querySelectorAll("button, input, a"))
        .filter((e) =>
          /authorize exchange/i.test(
            (e.textContent || "") + " " + ((e as HTMLInputElement).value || "")
          )
        )
        .map((e) => ({
          html: e.outerHTML.slice(0, 400),
          visible: (e as HTMLElement).offsetParent !== null,
        }))
    );
    console.log("authorize buttons:", JSON.stringify(authorizeButtons, null, 1));
    page.on("dialog", (d) => {
      console.log(`DIALOG type=${d.type()} message=${d.message()}`);
      void d.accept();
    });
    page.on("response", (r) => {
      if (r.request().method() === "POST") {
        console.log(`POST ${r.status()} ${r.url()}`);
      }
    });
    const responsePromise = page
      .waitForResponse((r) => r.url().includes("authorizeExchange.json"), {
        timeout: 240000,
      })
      .then((r) => console.log(`AUTHORIZE RESPONSE ${r.status()} after wait`))
      .catch(() => console.log("AUTHORIZE RESPONSE never arrived in 240s"));
    await page
      .locator("button", { hasText: /authorize exchange/i })
      .first()
      .click();
    await responsePromise;
    console.log("radio state after:", JSON.stringify(await radioState()));
    await dump("after authorize");
  } else if (target === "sendconnect") {
    await ui.sendConnectionRequest(requireEnv("PM_USERNAME"));
    await dump("after send connection request");
  } else if (target === "provider-settings") {
    await page
      .getByRole("link", { name: /account settings/i })
      .first()
      .click();
    await page.waitForLoadState("domcontentloaded");
    await dump("account settings");
    const radios = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("#contact-is-searchable-div input")
      ).map((e) => e.outerHTML)
    );
    console.log("searchable radios:", JSON.stringify(radios, null, 1));
    const submits = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll(
          'button[type="submit"], input[type="submit"], button'
        )
      )
        .map((e) => e.outerHTML.slice(0, 200))
        .slice(0, 20)
    );
    console.log("submit candidates:", JSON.stringify(submits, null, 1));
    if (process.argv[3] === "--make-searchable") {
      const preferencesTab = page.getByRole("link", { name: /preferences/i });
      if (await preferencesTab.count()) {
        await preferencesTab.first().click();
      }
      const yes = page.locator("#contact-is-searchable-radio-yes");
      if (!(await yes.isChecked())) {
        await yes.check({ force: true });
        console.log("checked yes:", await yes.isChecked());
        await page.locator("#submitButtonMargin").click();
        await dump("after save");
      } else {
        console.log("already searchable");
      }
    }
  } else if (target === "sharing" || target === "wsshare") {
    if (target === "wsshare") {
      // A share needs a live connection: peer sends the request via the UI,
      // provider accepts via the SDK.
      const { PortfolioManager } = await import("../../src/PortfolioManager.js");
      const { PortfolioManagerApi } = await import(
        "../../src/PortfolioManagerApi.js"
      );
      const { DEFAULT_API_URL } = await import("./support.js");
      const provider = new PortfolioManager(
        new PortfolioManagerApi(
          process.env.PM_ENDPOINT || DEFAULT_API_URL,
          requireEnv("PM_USERNAME"),
          requireEnv("PM_PASSWORD")
        )
      );
      const pending = (await provider.getPendingConnections()).find(
        (c) => c.username === username
      );
      if (pending) {
        await provider.acceptConnection(pending.accountId, "probe accept");
        console.log("accepted pending connection from", username);
      } else {
        console.log("no pending connection; assuming already connected");
      }
    }
    await page.goto(`${ui.baseUrl}/sharing`, { waitUntil: "domcontentloaded" });
    await dump("sharing");
    if (target === "wsshare") {
      await page
        .getByRole("link", {
          name: /set up web services|share .*data exchange|exchanging data/i,
        })
        .first()
        .click();
      await page.waitForLoadState("domcontentloaded");
      await dump("ws bulk sharing");
      await page.locator("#buttonSelectProperties").click();
      await page.waitForTimeout(3000);
      const dialogHtml = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll(
            '[id*="dialog" i], [class*="modal" i], [class*="dialog" i]'
          )
        )
          .filter((e) => (e as HTMLElement).offsetParent !== null)
          .map((e) => e.outerHTML.slice(0, 3000))
          .slice(0, 3)
      );
      console.log("dialogs:", JSON.stringify(dialogHtml, null, 1));
    }
  }
} finally {
  await ui.close();
}
