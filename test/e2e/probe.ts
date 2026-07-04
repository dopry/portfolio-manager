/**
 * Selector-maintenance probe for the pmtest web UI. Logs in as the peer
 * account and dumps link/form structure for the page named on the CLI, so
 * EspmWebUi locators can be validated without guessing.
 *
 *   npx tsx test/e2e/probe.ts home|contacts|add|sharing|wsshare
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

const ui = new EspmWebUi({ headless: process.env.E2E_HEADLESS !== "false" });

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
  console.log("body text:", bodyText.replace(/\s+/g, " ").slice(0, 1500));
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
    const providerUsername = process.env.PM_USERNAME || "";
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
  } else if (target === "sendconnect") {
    await ui.sendConnectionRequest(process.env.PM_USERNAME || "");
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
      const provider = new PortfolioManager(
        new PortfolioManagerApi(
          "https://portfoliomanager.energystar.gov/wstest/",
          process.env.PM_USERNAME || "",
          process.env.PM_PASSWORD || ""
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
