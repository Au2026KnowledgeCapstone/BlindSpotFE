import { test, expect, type Page } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
const backend = process.env.NEXT_PUBLIC_API_BASE_URL!.replace(/\/$/, "");
const projectId = "11111111-1111-4111-8111-111111111111";
const otherProjectId = "22222222-2222-4222-8222-222222222222";
const environmentId = "33333333-3333-4333-8333-333333333333";
const runId = "44444444-4444-4444-8444-444444444444";
const userId = "55555555-5555-4555-8555-555555555555";
const requirementId = "66666666-6666-4666-8666-666666666666";
const pageOf = (items: unknown[]) => ({ items, next_cursor: null });
const project = (id: string, name: string) => ({ id, name, owner_id: userId, role: "owner", description: "Release readiness", created_at: "2026-11-17T00:00:00Z" });
const environment = (id: string) => ({ id: environmentId, project_id: id, name: "Staging", kind: "staging", base_url: "https://example.test", has_credentials: false, revision: 1, verified_at: null });
const run = (id: string) => ({ id: runId, run_number: 24, project_id: id, environment_id: environmentId, status: "completed", cancel_requested: false, requirement_snapshots: [{ id: requirementId, title: "Checkout", description: "", criteria: [] }], requested_by: userId, queued_at: "2026-11-17T14:00:00Z", action_count: 3 });
const result = (passed: boolean) => ({ id: "77777777-7777-4777-8777-777777777777", run_id: runId, requirement_id: requirementId, requirement_title: "Checkout", verdict: passed ? "pass" : "fail", classification: passed ? "criteria_satisfied" : "criteria_violated", observed_behavior: passed ? "Order confirmed" : "Order returned a server error", criterion_assessments: [], actions: [], evidence: [] });

async function mockBackend(page: Page) {
  // Exercise the real routes, session guard, API validation and components with isolated API fixtures.
  await page.route(`${backend}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname;
    const id = path.includes(otherProjectId) ? otherProjectId : projectId;
    let body: unknown = pageOf([]);
    if (path === "/auth/me") body = { id: userId, email: "ui-test@example.test" };
    else if (path === "/projects") body = pageOf([project(projectId, "Web application"), project(otherProjectId, "Customer portal")]);
    else if (path === `/projects/${id}`) body = project(id, ({ [projectId]: "Web application", [otherProjectId]: "Customer portal" })[id]!);
    else if (path.endsWith("/workspace")) body = { applications: pageOf([]), environments: pageOf([environment(id)]) };
    else if (path.endsWith("/environments")) body = pageOf([environment(id)]);
    else if (path.endsWith("/results")) body = pageOf([result(id === otherProjectId)]);
    else if (path.endsWith(`/runs/${runId}`)) body = run(id);
    else if (path.endsWith("/runs")) body = pageOf([run(id)]);
    await route.fulfill({ status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "http://localhost:3000", "Access-Control-Allow-Credentials": "true" }, body: JSON.stringify(body) });
  });
}

test("actual dashboard filters project verdicts and opens the real report", async ({ page }) => {
  await mockBackend(page);
  await page.goto("/dashboard");
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /W Web application/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Analysis history" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Account settings", exact: true })).toHaveCount(0);
  await page.goto(`/projects/${otherProjectId}/runs/${runId}?environmentId=${environmentId}`);
  await expect(page.getByRole("heading", { name: "Testing report", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "PASS", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Share Report", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Share report" })).toBeVisible();
});

test("actual project overview and runs show the latest test score", async ({ page }) => {
  await mockBackend(page);
  await page.goto(`/projects/${projectId}`);
  await expect(page.getByRole("heading", { name: "Web application", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Analysis history" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Share Report", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Environments", exact: true })).toHaveCount(0);
  await expect(page.locator("header summary")).toHaveCount(0);
  await page.screenshot({ path: "/tmp/blindspot-actual-overview.png", fullPage: true });
  await page.getByRole("link", { name: "View analysis →" }).click();
  await expect(page.getByRole("heading", { name: "Test Runs", exact: true })).toBeVisible();
  await expect(page.getByText("FAIL (0%)", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Checkout · Run #24", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("link", { name: "Overview", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("Stitch auth layout remains usable on mobile and stays light-only", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "/tmp/blindspot-stitch-login-mobile.png", fullPage: true });
  // There is no dark palette to switch into: forcing the old attribute must not
  // change a single rendered colour.
  const canvasBefore = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(canvasBefore);
});
