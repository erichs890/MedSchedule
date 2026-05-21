# 🩺 MedSchedule: Sistema de Agenda Médica

[![CI](https://github.com/erichs890/MedSchedule/actions/workflows/ci.yml/badge.svg)](https://github.com/erichs890/MedSchedule/actions/workflows/ci.yml)

Sistema de agenda médica para clínicas pequenas, consultórios e profissionais
da saúde. Centraliza agendamentos, gestão de pacientes, prontuário e
acompanhamento de consultas, substituindo papel, planilhas e agendas físicas.

Desafio técnico desenvolvido com **Next.js, TypeScript, TailwindCSS e
Supabase**, seguindo o design system "Clinical Precision" do protótipo.

## 📸 Telas

| Tema claro | Tema escuro |
| --- | --- |
| ![Tema claro](docs/screenshots/dashboard.png) | ![Tema escuro](docs/screenshots/dark-dashboard.png) |

| Agenda semanal (drag and drop) | Relatórios e indicadores |
| --- | --- |
| ![Agenda semanal](docs/screenshots/agenda-semana.png) | ![Relatórios](docs/screenshots/relatorios.png) |

| Prontuário do paciente | Busca global (Ctrl/⌘+K) |
| --- | --- |
| ![Prontuário](docs/screenshots/prontuario.png) | ![Command palette](docs/screenshots/command-palette.png) |

---

## 🔑 Acesso de demonstração

```
E-mail:  doutor@clinica.com.br
Senha:   medschedule123
```

## ▶️ Como rodar

```bash
npm install
npm run dev          # http://localhost:3000
npm run test         # testes unitários (Vitest)
npm run test:e2e     # testes ponta a ponta (Playwright)
```

> O arquivo `.env.local` (credenciais) não é versionado por segurança.
> Copie `.env.example` para `.env.local` e preencha os valores. Veja a seção
> [Configuração](#-configuração-supabase-ia-e-google).

## 🧰 Stack

| Camada         | Tecnologia                                       |
| -------------- | ------------------------------------------------ |
| Framework      | Next.js 16 (App Router), React 19 e TypeScript   |
| Estilo         | TailwindCSS v4                                   |
| Backend e banco| Supabase (PostgreSQL, Auth, Realtime, MFA, Storage) |
| Estado e cache | TanStack Query (React Query)                     |
| Gráficos       | Recharts                                         |
| IA             | Google Gemini                                    |
| Testes         | Vitest (unitários) e Playwright (ponta a ponta)  |

---

## ⭐ Diferenciais (além do escopo do desafio)

| # | Diferencial | Descrição |
|---|-------------|-----------|
| 🧠 | **IA na anotação clínica** | Reescreve a anotação livre em formato clínico estruturado (Google Gemini). |
| 💬 | **Assistente virtual (Sofia)** | Chatbot com IA que responde dúvidas sobre a clínica, os convênios e o uso do sistema. |
| 📊 | **Relatórios e indicadores** | Dashboard analítico com gráficos de receita, ticket médio, comparecimento e cancelamento. |
| 🗓️ | **Visão semanal com drag and drop** | Calendário semanal no qual você arrasta uma consulta para reagendá-la. |
| 📋 | **Prontuário do paciente** | Perfil completo com histórico clínico e upload de exames e documentos (Supabase Storage). |
| ⚡ | **Sincronização em tempo real** | A agenda se atualiza ao vivo entre os usuários (Supabase Realtime). |
| 🔐 | **Verificação em duas etapas (MFA)** | Autenticação de dois fatores por TOTP (aplicativo autenticador). |
| 🔔 | **Central de notificações** | Sino que lista consultas atrasadas, pacientes aguardando e próximos atendimentos. |
| ⌨️ | **Command palette (Ctrl/⌘+K)** | Busca global e ações rápidas por teclado. |
| 👤 | **Cadastro e login com Google** | Registro de usuários e autenticação social (OAuth). |
| 🖼️ | **Perfil do usuário** | Conta acessível pela barra lateral, com upload de foto (Supabase Storage) e importação automática da foto do Google. |
| 📱 | **PWA e responsividade** | Aplicativo instalável, com layout fluido para celular, tablet e computador. |
| 🌗 | **Tema claro e escuro** | Alternância de tema com persistência e detecção da preferência do sistema. |
| 🛡️ | **Segurança** | RLS, MFA, cabeçalhos de segurança e rate limiting nas rotas de IA. |

---

## ✅ Funcionalidades do MVP

- **Autenticação:** login com e-mail e senha, cadastro e login com Google, além
  de rotas protegidas.
- **Calendário e dashboard:** calendário mensal com indicadores e resumo do dia.
- **Agenda diária:** turnos de manhã, tarde e noite, com os estados visuais
  (normal, em atendimento, realizado, cancelado e atrasado).
- **Agendamentos:** criação, edição, cancelamento e detalhe em painel lateral,
  com anotação clínica, histórico e fluxo de status.
- **Pacientes:** cadastro com máscaras e validações, além de listagem com busca
  e prontuário.
- **Conta do usuário:** perfil com foto (enviada por upload ou importada do
  Google), 2FA e preferências, acessível direto pela barra lateral.
- **Consultas**, **histórico**, **configurações** e **página 404**.

Toda ação ocorre **sem recarregar a página**, com feedback por meio de toasts.

## 🧪 Qualidade e engenharia

- **Testes unitários** (Vitest) para as regras de negócio e as formatações.
- **Testes ponta a ponta** (Playwright) que cobrem login, navegação e proteção
  de rotas.
- **CI no GitHub Actions** que roda lint, testes e build a cada push.
- **Error boundaries** (`error.tsx`, `loading.tsx` e `global-error.tsx`) que
  garantem que o app nunca quebre em tela branca.
- **TypeScript** estrito e **ESLint** sem avisos.

## 📋 Regras de negócio

- Atendimento das **07:00 às 19:00**, em slots de **30 minutos**.
- Fluxo de status: `agendado → confirmado → aguardando → em atendimento →
  realizado`. O cancelamento é permitido a partir de agendado ou confirmado.
- Não são permitidos dois agendamentos no mesmo horário (índice único no banco).
- Consultas canceladas ou realizadas permanecem no histórico e não podem ser
  editadas.
- Consultas vencidas e ainda não atendidas recebem o estado visual **"Atrasado"**.

## 🛡️ Segurança

- Autenticação real com Supabase Auth e verificação em duas etapas (TOTP).
- Row Level Security em todas as tabelas.
- Cabeçalhos de segurança contra clickjacking e MIME sniffing, além de HSTS.
- Rate limiting nas rotas de IA. As chaves de API são processadas somente no
  servidor.

## 📁 Estrutura do projeto

```
src/
  app/
    login/ cadastro/ auth/callback/   Autenticação (e-mail, Google e 2FA)
    (app)/                            Área autenticada
      page.tsx        Calendário e dashboard
      agenda/         Agenda diária e visão semanal
      pacientes/      Pacientes e prontuário ([id])
      consultas/ relatorios/ historico/ configuracoes/
      error.tsx loading.tsx           Tratamento de erros
    api/ai/ api/chat/                 Route handlers de IA
    not-found.tsx manifest.ts icon.tsx
  components/         AppShell, modais, painel de detalhe, chat,
                      command palette, notificações, MFA e UI base
  lib/                Supabase, tipos, hooks, realtime e gemini
  proxy.ts            Proteção de rotas e verificação de MFA
db/                   schema.sql · seed.sql · storage.sql
e2e/                  Testes ponta a ponta (Playwright)
```

## ⚙️ Configuração (Supabase, IA e Google)

1. Crie um projeto em [supabase.com](https://supabase.com) e, no **SQL Editor**,
   execute `db/schema.sql`, `db/seed.sql` e `db/storage.sql`.
2. Copie `.env.example` para `.env.local` e preencha os valores:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   GEMINI_API_KEY=...          # opcional, para os recursos de IA
   ```
3. **IA (opcional):** obtenha uma chave gratuita em
   [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
4. **Login com Google (opcional):** habilite o provedor Google em
   Authentication → Providers, no Supabase.

## 🧩 Decisões técnicas

- O **Supabase** entrega PostgreSQL, Auth, Realtime, MFA e Storage já prontos.
- O **React Query** centraliza o cache: cada mutação e cada evento em tempo real
  invalida as queries afetadas, mantendo todas as telas atualizadas.
- A **IA** roda em route handlers no servidor, protegidos por sessão e por rate
  limiting, sem expor a chave de API ao cliente.
- O `useSyncExternalStore` é usado para evitar divergências de hidratação no
  conteúdo que depende de dados do cliente.
