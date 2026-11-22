import { test, expect } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
const backend = process.env.NEXT_PUBLIC_API_BASE_URL!.replace(/\/$/, "");
const projectId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";
const environmentId = "33333333-3333-4333-8333-333333333333";
const applicationId = "44444444-4444-4444-8444-444444444444";
const project = { id: projectId, owner_id: userId, name: "Checkout Core App", description: "A medical app for patients", role: "owner", created_at: "2026-11-17T00:00:00Z" };
const pageOf = (items: unknown[]) => ({ items, next_cursor: null });
const environments = ["Staging", "Production", "Preview / Dev"].map((name, index) => ({ id: index ? `33333333-3333-4333-8333-33333333333${index}` : environmentId, project_id: projectId, application_id: applicationId, name, kind: ["staging", "production", "development"][index], base_url: `https://${["staging", "app", "dev"][index]}.example.test`, has_credentials: true, revision: 1, verified_at: "2026-11-17T00:00:00Z" }));
const titles = ["Conversation refresh must update messages with new incoming content without page reload", "Patient messaging must show conversation with incoming/outgoing distinction and support message retrieval", "Progress report review must open reports and show selected report details including image", "Pain log review must open pain history and show details for selected logs", "Multi-currency Checkout Conversion Flow with automated assertion checks"];
const requirements = Array.from({ length: 20 }, (_, index) => ({ id: `55555555-5555-4555-8555-${String(index).padStart(12, "0")}`, project_id: projectId, title: titles[index % 5], description: "Product acceptance requirement", category: "functional", priority: index ? "high" : "medium", approval_status: index < 7 ? "approved" : "draft", acceptance_criteria: [{ id: "criterion-1", text: "Expected behavior is visible", position: 0 }], source: { kind: "manual", warnings: [] }, latest_result: index < 5 ? { run_id: "66666666-6666-4666-8666-666666666666", verdict: index < 2 ? "pass" : "inconclusive", completed_at: "2026-11-17T00:00:00Z" } : null, created_at: "2026-11-17T00:00:00Z", updated_at: "2026-11-17T00:00:00Z" }));

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  // eslint-disable-next-line complexity -- Fixture dispatch covers the independent page API contracts.
  await page.route(`${backend}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = pageOf([]);
    if (path === "/auth/me") body = { id: userId, email: "devin@example.test" };
    else if (path === "/projects") body = pageOf([project]);
    else if (path === `/projects/${projectId}`) body = project;
    else if (path.endsWith("/workspace")) body = { applications: pageOf([{ id: applicationId, project_id: projectId, name: "Checkout Web" }]), environments: pageOf(environments) };
    else if (path.endsWith("/environments")) body = pageOf(environments);
    else if (path.endsWith("/requirements")) body = pageOf(requirements);
    else if (path.endsWith("/runs")) body = pageOf(path.includes(environmentId) ? Array.from({ length: 4 }, (_, index) => ({ id: `66666666-6666-4666-8666-${String(index).padStart(12, "0")}`, project_id: projectId, environment_id: environmentId, run_number: 24 - index, status: "completed", cancel_requested: false, requirement_snapshots: [{ id: requirements[0]!.id, title: "Checkout", description: "", criteria: [] }], requested_by: userId, queued_at: `2026-11-${17 - index}T10:00:00Z`, started_at: `2026-11-${17 - index}T10:00:00Z`, completed_at: `2026-11-${17 - index}T10:04:12Z`, action_count: 8 })) : []);
    else if (path.endsWith("/results")) body = pageOf([{ id: "88888888-8888-4888-8888-888888888888", run_id: path.split("/").at(-2), requirement_id: requirements[0]!.id, requirement_title: "Checkout", verdict: path.includes("66666666-6666-4666-8666-000000000000") ? "fail" : "pass", classification: "criteria_satisfied", observed_behavior: "Order confirmation recorded", criterion_assessments: [], actions: [], evidence: [] }]);
    else if (path.endsWith("/members")) body = pageOf(["Sarah Lin", "Alex Rivera", "David Kim", "Maya Patel", "Lucas Chen", "Elena Rostova", "Rachel Adams"].map((display_name, index) => ({ user_id: `77777777-7777-4777-8777-${String(index).padStart(12, "0")}`, display_name, role: index === 0 ? "owner" : index < 3 ? "admin" : "member" })));
    await route.fulfill({ status: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  });
});

test("overview matches Stitch composition with real requirement totals", async ({ page }) => {
  await page.goto(`/projects/${projectId}`);
  await expect(page.getByRole("heading", { name: "Checkout Core App", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Validation status" })).toBeVisible();
  await expect(page.getByText("5", { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: "/tmp/stitch-overview-desktop.png" });
});

test("requirements supports filters and pagination in the Stitch table", async ({ page }) => {
  await page.goto(`/projects/${projectId}/requirements`);
  await expect(page.getByText("Showing 1–5 of 20 requirements")).toBeVisible();
  await page.screenshot({ path: "/tmp/stitch-requirements-desktop.png" });
  await page.getByRole("button", { name: "Draft 13" }).click();
  await expect(page.getByText("Showing 1–5 of 13 requirements")).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Showing 6–10 of 13 requirements")).toBeVisible();
  await page.getByRole("searchbox", { name: "Search requirements" }).fill("Pain log");
  await expect(page.getByText("Showing 1–3 of 3 requirements")).toBeVisible();
});

test("setup and team use the matching card layouts and working selection", async ({ page }) => {
  await page.goto(`/projects/${projectId}/setup`);
  await expect(page.getByRole("heading", { name: "Test Login Credentials" })).toBeVisible();
  await page.getByRole("button", { name: "Production environment", exact: true }).click();
  await expect(page.getByRole("button", { name: "Production environment", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: "/tmp/stitch-setup-desktop.png" });
  await page.goto(`/projects/${projectId}/members`);
  await expect(page.getByRole("heading", { name: "Team Roster & Access Roles" })).toBeVisible();
  await page.screenshot({ path: "/tmp/stitch-team-desktop.png" });
  await page.getByRole("textbox", { name: "Search members" }).fill("Sarah");
  await expect(page.getByText("Sarah Lin", { exact: true })).toBeVisible();
  await expect(page.getByText("David Kim", { exact: true })).not.toBeVisible();
});

test("account preferences save and all layouts fit a narrow viewport", async ({ page }) => {
  await page.goto("/account/settings");
  await expect(page.getByRole("heading", { name: "General Profile" })).toBeVisible();
  await page.getByLabel("Display Name").fill("Devin Vance");
  await page.getByRole("button", { name: "Save Changes →" }).click();
  await expect(page.getByRole("heading", { name: "Devin Vance" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Profile preferences saved on this device.");
  await page.screenshot({ path: "/tmp/stitch-account-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const suffix of ["", "/requirements", "/setup", "/environments", "/members", "/runs"]) {
    await page.goto(`/projects/${projectId}${suffix}`);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Layout overflow on ${suffix || "overview"}`).toBe(true);
  }
});


test("test runs displays outcome telemetry and the execution trail", async ({ page }) => {
  await page.goto(`/projects/${projectId}/runs`);
  await expect(page.getByRole("heading", { name: "Runs Summary" })).toBeVisible();
  await expect(page.getByText("75%", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Execution Trail & Run History" })).toBeVisible();
  await page.screenshot({ path: "/tmp/stitch-runs-desktop.png" });
});

test("v2 import modal uploads BRD and SRS and shows reviewable results", async ({ page }) => {
  let complete!: () => void;
  const pending = new Promise<void>((resolve) => { complete = resolve; });
  let upload: { contentType: string | undefined; csrf: string | undefined; body: string } | undefined;
  await page.route(`${backend}/projects/${projectId}/imports`, async (route) => {
    upload = { contentType: route.request().headers()["content-type"], csrf: route.request().headers()["x-csrf-protection"], body: route.request().postData() || "" };
    await pending;
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ import_id: "99999999-9999-4999-8999-999999999999", documents: [{ id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", role: "brd", filename: "BRD.md", sha256: "checksum" }, { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", role: "srs", filename: "SRS.md", sha256: "checksum" }], requirements: requirements.slice(7, 9), warnings: ["Confirm payment behavior before approval."] }) });
  });
  await page.goto(`/projects/${projectId}/requirements`);
  await page.getByRole("button", { name: "Import requirements", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Import requirements" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Extract requirements" })).toBeDisabled();
  await expect(dialog.getByRole("radio")).toHaveCount(0);
  await dialog.getByLabel("Business Requirements Document (BRD)", { exact: true }).setInputFiles({ name: "BRD.md", mimeType: "text/markdown", buffer: Buffer.from("Customers can complete checkout.") });
  await dialog.getByLabel("Software Requirements Specification (SRS)", { exact: true }).setInputFiles({ name: "SRS.md", mimeType: "text/markdown", buffer: Buffer.from("Show the order confirmation screen.") });
  await expect(dialog.getByRole("button", { name: "Extract requirements" })).toBeEnabled();
  await page.screenshot({ path: "/tmp/blindspot-v2-import-dialog.png" });
  await dialog.getByRole("button", { name: "Extract requirements" }).click();
  await expect(dialog.getByRole("status")).toContainText("Reading sources");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  expect(upload?.contentType).toContain("multipart/form-data; boundary=");
  expect(upload?.csrf).toBe("1");
  expect(upload?.body).toContain('name="brd"');
  expect(upload?.body).toContain('filename="SRS.md"');
  complete();
  await expect(dialog.getByRole("heading", { name: "2 new drafts ready for review" })).toBeVisible();
  await expect(dialog.getByText("Confirm payment behavior before approval.")).toBeVisible();
  await dialog.getByRole("button", { name: "Review requirements" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Import requirements", exact: true })).toBeFocused();
});

test("v2 requirement details preserve provenance and open a separate editor", async ({ page }) => {
  await page.route(`${backend}/projects/${projectId}/requirements`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(pageOf(requirements.map((requirement, index) => index ? requirement : { ...requirement, source: { kind: "imported", document_name: "BRD.md", document_role: "brd", excerpt: "Messages refresh without reloading the page.", warnings: [] } }))) }));
  await page.goto(`/projects/${projectId}/requirements`);
  await page.getByRole("button", { name: `View ${titles[0]}` }).click();
  const details = page.getByRole("dialog", { name: "Requirement details" });
  await expect(details.getByRole("heading", { name: "Acceptance criteria" })).toBeVisible();
  await expect(details.getByText("Expected behavior is visible")).toBeVisible();
  await expect(details.getByText("Messages refresh without reloading the page.")).toBeVisible();
  await details.getByRole("button", { name: "Edit", exact: true }).click();
  const editor = page.getByRole("dialog", { name: "Edit requirement" });
  await expect(editor).toBeVisible();
  await expect(editor.getByLabel("Title", { exact: true })).toHaveValue(titles[0]!);
  await page.keyboard.press("Escape");
  await expect(editor).not.toBeVisible();
  await page.getByRole("button", { name: "Add requirement", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Add requirement" })).toBeVisible();
});

test("v2 document validation reports errors and modal fits a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/projects/${projectId}/requirements`);
  await page.getByRole("button", { name: "Import requirements", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Import requirements" });
  await dialog.getByLabel("Business Requirements Document (BRD)", { exact: true }).setInputFiles({ name: "BRD.exe", mimeType: "application/octet-stream", buffer: Buffer.from("Invalid document") });
  await dialog.getByLabel("Software Requirements Specification (SRS)", { exact: true }).setInputFiles({ name: "SRS.md", mimeType: "text/markdown", buffer: Buffer.from("Requirements") });
  await dialog.getByRole("button", { name: "Extract requirements" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Choose Word");
  const bounds = await dialog.boundingBox();
  expect(bounds!.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "/tmp/blindspot-v2-import-mobile.png" });
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).not.toBeVisible();
});
