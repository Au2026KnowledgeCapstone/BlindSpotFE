import { test, expect } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
const backend = process.env.NEXT_PUBLIC_API_BASE_URL!.replace(/\/$/, "");
const projectId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";
const environmentId = "33333333-3333-4333-8333-333333333333";
const applicationId = "44444444-4444-4444-8444-444444444444";
const newId = "55555555-5555-4555-8555-555555555555";
const pageOf = (items: unknown[]) => ({ items, next_cursor: null });

test("setup creates and edits environments, saves a login, and verifies the selected target", async ({ page }) => {
  const applications = [{ id: applicationId, project_id: projectId, name: "Customer Portal" }];
  const environments = [{ id: environmentId, project_id: projectId, name: "Staging", kind: "staging", base_url: "https://staging.example.test", has_credentials: false, revision: 1, verified_at: null as string | null }];
  let failVerification = true;
  let savedCredentials: Record<string, string> | null = null;
  await page.setViewportSize({ width: 1440, height: 1050 });
  // eslint-disable-next-line complexity -- This isolated fixture mirrors the setup read/write routes and their revision changes.
  await page.route(`${backend}/**`, async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    let body: unknown = pageOf([]);
    if (path === "/auth/me") body = { id: userId, email: "setup@example.test" };
    else if (path === "/projects") body = pageOf([{ id: projectId, owner_id: userId, name: "Customer Portal", role: "owner", created_at: "2026-11-17T00:00:00Z" }]);
    else if (path === `/projects/${projectId}`) body = { id: projectId, owner_id: userId, name: "Customer Portal", role: "owner", created_at: "2026-11-17T00:00:00Z" };
    else if (path.endsWith("/workspace")) body = { applications: pageOf(applications), environments: pageOf(environments) };
    else if (path.endsWith("/applications") && request.method() === "POST") {
      const app = { id: newId, project_id: projectId, name: request.postDataJSON().name };
      applications.push(app); body = app;
    } else if (path.endsWith("/environments") && request.method() === "POST") {
      const input = request.postDataJSON();
      const environment = { id: newId, project_id: projectId, name: input.name, kind: input.kind, base_url: input.base_url, has_credentials: false, revision: 1, verified_at: null };
      environments.push(environment); body = environment;
    } else if (path.endsWith("/environments")) body = pageOf(environments);
    else if (path.includes("/environments/") && request.method() === "PATCH") {
      const environment = environments.find((item) => item.id === path.split("/").at(-1))!;
      const input = request.postDataJSON();
      if ("credentials" in input) { savedCredentials = input.credentials; environment.has_credentials = input.credentials !== null; environment.revision++; environment.verified_at = null; }
      if (input.base_url && environment.base_url !== input.base_url) { environment.verified_at = null; environment.revision++; }
      for (const key of ["name", "kind", "base_url"] as const) if (input[key]) environment[key] = input[key];
      body = environment;
    } else if (path.endsWith("/verify")) {
      const environment = environments.find((item) => item.id === path.split("/").at(-2))!;
      environment.verified_at = failVerification ? null : "2026-11-18T10:00:00Z";
      body = { status: failVerification ? "failed" : "verified" };
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.goto(`/projects/${projectId}/setup`);
  await expect(page.getByRole("heading", { name: "Staging configuration" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify target", exact: true })).toBeEnabled();
  await page.screenshot({ path: "/tmp/blindspot-setup-public.png" });
  await expect(page.getByRole("heading", { name: "Applications", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Login Verification", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "New environment", exact: true }).click();
  const create = page.getByRole("dialog", { name: "New environment" });
  await expect(create.getByLabel("Application", { exact: true })).toHaveCount(0);
  await create.getByLabel("Environment name").fill("QA Preview");
  await create.getByLabel("Environment type").selectOption("development");
  await create.getByLabel("Base URL", { exact: true }).fill("https://qa.example.test");
  await create.getByRole("button", { name: "Add environment", exact: true }).click();
  await expect(page.getByRole("button", { name: "QA Preview environment", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Edit QA Preview" }).click();
  const edit = page.getByRole("dialog", { name: "Edit environment" });
  await edit.getByLabel("Base URL", { exact: true }).fill("https://preview.example.test/login");
  await edit.getByRole("button", { name: "Save environment" }).click();
  const credentials = page.locator("details").filter({ has: page.getByRole("heading", { name: "Test Login Credentials" }) });
  await expect(credentials).not.toHaveAttribute("open", "");
  await credentials.locator("summary").click();
  await page.getByLabel("Login method").selectOption("email_password");
  await page.getByLabel("Test account username").fill("qa@example.test");
  await page.getByLabel("Test account password", { exact: true }).fill("isolated-test-password");
  await page.getByLabel("Login success selector", { exact: true }).fill("#dashboard");
  await page.getByText("Advanced login field selectors").click();
  await page.getByLabel("Submit button selector").fill('button[type="submit"]');
  await page.getByRole("button", { name: "Save authentication" }).click();
  await expect(page.getByText("Authentication saved. Verify this target before starting a run.")).toBeVisible();
  expect(savedCredentials).toEqual({ username: "qa@example.test", password: "isolated-test-password", success_selector: "#dashboard", submit_selector: 'button[type="submit"]' });
  await expect(page.getByLabel("Test account password", { exact: true })).toHaveValue("");
  await page.getByRole("button", { name: "Verify target", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Verification did not succeed" })).toBeVisible();
  failVerification = false;
  await page.getByRole("button", { name: "Verify target", exact: true }).click();
  await expect(page.getByText("Target verified. This environment is ready for browser checks.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Re-verify target" })).toBeVisible();
  await page.screenshot({ path: "/tmp/blindspot-setup-configured.png" });
  await page.getByRole("link", { name: "Go to test runs", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Environment", exact: true })).toHaveValue(newId);
});
