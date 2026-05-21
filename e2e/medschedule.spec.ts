import { test, expect, type Page } from "@playwright/test";

const DEMO = { email: "doutor@clinica.com.br", senha: "medschedule123" };

async function login(page: Page) {
  await page.goto("/login");
  await page.fill("#email", DEMO.email);
  await page.fill("#password", DEMO.senha);
  await page.click('button:has-text("Entrar")');
  await page.waitForURL("/");
}

test("a tela de login é exibida com as opções de acesso", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Bem-vindo de volta")).toBeVisible();
  await expect(page.getByText("Entrar com Google")).toBeVisible();
  await expect(page.getByText("Cadastre-se")).toBeVisible();
});

test("rotas protegidas redirecionam para o login", async ({ page }) => {
  await page.goto("/agenda");
  await page.waitForURL("**/login");
  expect(page.url()).toContain("/login");
});

test("login com as credenciais demo leva ao dashboard", async ({ page }) => {
  await login(page);
  await expect(
    page.getByRole("heading", { name: "Calendário" }),
  ).toBeVisible();
});

test("navegação entre as telas principais", async ({ page }) => {
  await login(page);

  await page.goto("/agenda");
  await expect(page.getByText("Manhã")).toBeVisible();

  await page.goto("/relatorios");
  await expect(page.getByText("Relatórios e indicadores")).toBeVisible();

  await page.goto("/pacientes");
  await expect(page.getByPlaceholder(/Buscar por nome/)).toBeVisible();
});

test("rota inexistente exibe a página 404", async ({ page }) => {
  await login(page);
  await page.goto("/rota-que-nao-existe");
  await expect(page.getByText("Página não encontrada")).toBeVisible();
});
