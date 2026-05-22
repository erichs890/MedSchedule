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

/* ----------------------- Modais, validação e CRUD ---------------------- */

test("o modal fecha ao pressionar Escape", async ({ page }) => {
  await login(page);
  await page.goto("/pacientes");
  await page.getByRole("button", { name: "Novo paciente" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("o formulário de paciente valida campos obrigatórios", async ({
  page,
}) => {
  await login(page);
  await page.goto("/pacientes");
  await page.getByRole("button", { name: "Novo paciente" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Cadastrar Paciente" }).click();
  await expect(page.getByText("Informe o nome do paciente.")).toBeVisible();
});

test("cadastra um novo paciente", async ({ page }) => {
  await login(page);
  await page.goto("/pacientes");
  await page.getByRole("button", { name: "Novo paciente" }).click();
  const dialog = page.getByRole("dialog");
  const nome = `Paciente Teste ${Date.now()}`;
  await dialog.locator("#p-name").fill(nome);
  await dialog.getByRole("button", { name: "Cadastrar Paciente" }).click();
  await expect(
    page.getByText("Paciente cadastrado com sucesso."),
  ).toBeVisible();
  await expect(page.getByText(nome)).toBeVisible();
});

test("o formulário de agendamento valida campos obrigatórios", async ({
  page,
}) => {
  await login(page);
  await page
    .getByRole("button", { name: "Novo agendamento" })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Salvar Agendamento" }).click();
  await expect(page.getByText("Selecione um paciente.")).toBeVisible();
});

test("cria um novo agendamento", async ({ page }) => {
  await login(page);
  await page
    .getByRole("button", { name: "Novo agendamento" })
    .first()
    .click();

  const apptDialog = page.getByRole("dialog", { name: "Novo Agendamento" });
  await expect(apptDialog).toBeVisible();

  // Cadastra o paciente pelo botão "Novo" do próprio formulário.
  const nome = `Consulta Teste ${Date.now()}`;
  await apptDialog.getByRole("button", { name: "Novo" }).click();
  const patientDialog = page.getByRole("dialog", {
    name: "Cadastro de Paciente",
  });
  await patientDialog.locator("#p-name").fill(nome);
  await patientDialog
    .getByRole("button", { name: "Cadastrar Paciente" })
    .click();

  // O paciente recém-criado fica selecionado no agendamento.
  await expect(apptDialog.getByText(nome)).toBeVisible();

  // Data distante e variável: evita conflito de horário entre execuções.
  const future = new Date();
  future.setDate(
    future.getDate() + 120 + (Math.floor(Date.now() / 60_000) % 900),
  );
  await apptDialog.locator("#a-date").fill(future.toISOString().slice(0, 10));

  const slot = apptDialog.locator('#a-time option[value="07:00"]');
  await expect(slot).toBeEnabled();
  await apptDialog.locator("#a-time").selectOption("07:00");

  await apptDialog
    .getByRole("button", { name: "Salvar Agendamento" })
    .click();
  await expect(
    page.getByText("Agendamento criado com sucesso."),
  ).toBeVisible();
});
