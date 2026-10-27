import { test, expect } from "@playwright/test";
import { neon } from "@neondatabase/serverless";
process.loadEnvFile(".env.local");
test.afterEach(async ({ context }) => {
  const id = (await context.cookies()).find(
    (cookie) => cookie.name === "diflh_session",
  )?.value;
  if (!id) return;
  const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
  await sql.transaction([
    sql`delete from study_marks where session_id=${id}`,
    sql`delete from study_drafts where session_id=${id}`,
    sql`delete from background where session_id=${id}`,
    sql`delete from pair_responses where session_id=${id}`,
    sql`delete from sessions where id=${id}`,
  ]);
});

test("small screens cannot start the study", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto("/");
  await expect(
    page.getByText("This study needs a laptop or desktop computer.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "English" })).toBeHidden();
});

test("English study: timed viewing, reasons, annotations, refresh, and background", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/");
  await page.getByRole("button", { name: "English" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/welcome.png" });
  await page.getByRole("link", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  const a = page.getByRole("tab", { name: "Website A", exact: true }),
    b = page.getByRole("tab", { name: "Website B", exact: true });
  const enjoy = page.getByRole("radio", {
    name: "I enjoy A more",
    exact: true,
  });
  await expect(enjoy).toHaveAttribute("aria-disabled", "true");
  await enjoy.click({ force: true });
  await expect(page.getByRole("tooltip").first()).toContainText(
    "Please open both",
  );
  await b.click();
  await enjoy.click({ force: true });
  await expect(page.getByRole("tooltip").first()).toContainText(
    "a little more time",
  );
  await page.waitForTimeout(5300);
  await a.click();
  await page.waitForTimeout(5300);
  await expect(enjoy).toHaveAttribute("aria-disabled", "false");
  await enjoy.click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  const ratings = page.getByRole("radiogroup");
  await ratings.nth(0).getByRole("radio", { name: "3", exact: true }).click();
  await ratings.nth(1).getByRole("radio", { name: "3", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("radio", { name: "Can't decide", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".reason-row")).toHaveCount(2);
  await page
    .locator(".reason-row")
    .first()
    .getByRole("button", { name: "Other", exact: true })
    .click();
  await page
    .getByPlaceholder("Please describe")
    .fill("The navigation felt familiar.");
  await expect(page.getByPlaceholder("Please describe")).toHaveAttribute(
    "maxlength",
    "200",
  );
  await page
    .getByPlaceholder("Type your thoughts here, in Chinese or English.")
    .fill("Browser verification");
  await page
    .getByRole("button", { name: "Mark on website", exact: true })
    .click();
  const overlay = page.locator(".annotation-overlay");
  await expect(overlay).toBeVisible();
  const box = await overlay.boundingBox();
  if (!box) throw new Error("overlay bounds");
  await page.mouse.move(box.x + 100, box.y + 80);
  await page.mouse.down();
  await page.mouse.move(box.x + 350, box.y + 170, { steps: 10 });
  await page.mouse.up();
  await expect(page.getByPlaceholder("Add a note (optional)")).toBeVisible({
    timeout: 30000,
  });
  await page
    .getByPlaceholder("Add a note (optional)")
    .fill("Header navigation");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.locator(".annotation-list img")).toHaveCount(1);
  await expect(page.locator(".annotation-list img")).toHaveJSProperty(
    "complete",
    true,
  );
  await page.screenshot({ path: "test-results/reasons.png" });
  await page.waitForTimeout(4500);
  await page.reload();
  await expect(page.locator(".reason-row")).toHaveCount(2);
  await expect(page.getByPlaceholder("Please describe")).toHaveValue(
    "The navigation felt familiar.",
  );
  await expect(page.locator(".annotation-list img")).toHaveCount(1);
  const pairCount = Number(
    (await page.locator(".progress").innerText()).match(/of (\d+)/)?.[1],
  );
  await page.getByRole("button", { name: "Next pair", exact: true }).click();
  await expect(page.locator(".progress")).toContainText("Pair 2");
  // Current fixture corpus has three types. Regeneration expands this loop automatically.
  let pair = 2;
  while (pair <= pairCount) {
    if (pair > 10) throw new Error("Unexpected pair count");
    await page.getByRole("tab", { name: "Website B", exact: true }).click();
    await page.waitForTimeout(5300);
    await page.getByRole("tab", { name: "Website A", exact: true }).click();
    await page.waitForTimeout(5300);
    await page
      .getByRole("radio", { name: "I enjoy both", exact: true })
      .click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page
      .getByRole("radiogroup")
      .nth(0)
      .getByRole("radio", { name: "4", exact: true })
      .click();
    await page
      .getByRole("radiogroup")
      .nth(1)
      .getByRole("radio", { name: "2", exact: true })
      .click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("radio", { name: "Website B", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.locator(".reason-row")).toHaveCount(3);
    await page
      .getByRole("button", { name: /^(Next pair|One last step)$/ })
      .click();
    if (pair < pairCount)
      await expect(page.locator(".progress")).toContainText(`Pair ${pair + 1}`);
    else
      await expect(
        page.getByRole("heading", { name: "A few questions about you" }),
      ).toBeVisible();
    pair++;
  }
  await expect(
    page.getByRole("heading", { name: "A few questions about you" }),
  ).toBeVisible();
  await expect(page.locator(".background-question").first().getByRole("radio").first()).toBeEnabled();
  await page
    .getByRole("button", { name: "Submit", exact: true })
    .click({ force: true });
  await expect(page.locator(".background-question.is-missing")).toHaveCount(1);
  const questions = page.locator(".background-question");
  for (let index = 0; index < 9; index++)
    if (index !== 1)
      await questions.nth(index).getByRole("radio").first().click();
  await expect(
    page.getByRole("button", { name: "Submit", exact: true }),
  ).toHaveAttribute("aria-disabled", "false");
  await page.screenshot({ path: "test-results/background.png" });
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Thank you!" })).toBeVisible();
});

test("Chinese introduction and survey use the final wording", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/");
  await page.getByRole("button", { name: "简体中文" }).click();
  await expect(
    page.getByRole("heading", { name: "欢迎参加本研究" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "继续", exact: true }).click();
  await page.getByRole("button", { name: "跳过", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "网站 A", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".question-copy")).toHaveText("您更喜欢哪个网站？");
  const sizes = await page
    .locator(".survey")
    .evaluate((element) =>
      [...element.querySelectorAll("*")]
        .filter(
          (node) =>
            node.childNodes.length &&
            [...node.childNodes].some(
              (child) => child.nodeType === 3 && child.textContent?.trim(),
            ),
        )
        .map((node) => parseFloat(getComputedStyle(node).fontSize)),
    );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  await page.screenshot({ path: "test-results/chinese-survey.png" });
});
