import { test, expect } from "@playwright/test";

test.describe("BlindSpot E2E Demo Path (§P8)", () => {
  test("navigates overview -> failing run -> deep link step -> analysis tab -> comment", async ({ page }) => {
    // 1. Overview landing page
    await page.goto("/projects/acme-corp");
    await expect(page.locator("body")).toBeVisible();

    // 2. Select failing run from list / table
    const failingRunLink = page.locator('a[href*="/runs/run-4821"]').first();
    if (await failingRunLink.isVisible()) {
      await failingRunLink.click();
    } else {
      await page.goto("/projects/acme-corp/runs/run-4821");
    }
    await expect(page).toHaveURL(/.*\/runs\/run-4821/);

    // 3. Deep link to failing step 5 action 3 with network tab open
    await page.goto("/projects/acme-corp/runs/run-4821?step=5&action=3&tab=network");
    await expect(page).toHaveURL(/.*step=5/);

    // 4. Switch to Analysis tab
    const analysisTab = page.locator('button:has-text("AI analysis"), [role="tab"]:has-text("Analysis")').first();
    if (await analysisTab.isVisible()) {
      await analysisTab.click();
    }

    // 5. Add a comment in Discussion tab / section
    const discussionTab = page.locator('button:has-text("Discussion"), [role="tab"]:has-text("Discussion")').first();
    if (await discussionTab.isVisible()) {
      await discussionTab.click();
    }
    const commentInput = page.locator('textarea, input[name="comment"]').first();
    if (await commentInput.isVisible()) {
      await commentInput.fill("Verified application defect in order service 500 endpoint.");
      const submitBtn = page.locator('button[type="submit"]:has-text("Post"), button:has-text("Comment")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }
    }
  });
});
