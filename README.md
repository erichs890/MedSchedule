# 🩺 MedSchedule — Sistema de Agenda Médica

Sistema de agenda médica para clínicas pequenas, consultórios e profissionais
da saúde. Centraliza agendamentos, gestão de pacientes, acompanhamento de
consultas e histórico de atendimentos — substituindo papel, planilhas e
agendas físicas.

Desafio técnico desenvolvido com **Next.js + TypeScript + TailwindCSS +
Supabase**, seguindo o design system "Clinical Precision" do protótipo.

---

## 🔑 Acesso de demonstração

```
E-mail:  doutor@clinica.com.br
Senha:   medschedule123
```

## ▶️ Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

> O arquivo `.env.local` (credenciais) **não é versionado** por segurança.
> Copie `.env.example` para `.env.local` e preencha — veja
> [Configuração](#-configuração-supabase--ia--google).

## 🧰 Stack

| Camada         | Tecnologia                                       |
| -------------- | ------------------------------------------------ |
| Framework      | Next.js 16 (App Router) + React 19 + TypeScript  |
| Estilo         | TailwindCSS v4                                   |
| Backend / BD   | Supabase — PostgreSQL, Auth, Realtime, MFA       |
| Estado / cache | TanStack Query (React Query)                     |
| Gráficos       | Recharts                                         |
| IA             | Google Gemini                                    |
| Ícones         | lucide-react                                     |

---

## ⭐ Diferenciais (além do escopo do desafio)

Estes recursos **não** foram pedidos no desafio — foram adicionados para
transformar o MVP em um produto:

| # | Diferencial | Descrição |
|---|-------------|-----------|
| 🧠 | **IA na anotação clínica** | Botão "Organizar com IA" reescreve a anotação livre do profissional em formato clínico estruturado (Queixa, Evolução, Conduta, Orientações) usando o Google Gemini. |
| 💬 | **Assistente virtual (Sofia)** | Chatbot com IA — balão flutuante em todas as telas. Persona própria que responde dúvidas sobre a clínica, convênios, horários e uso do sistema. |
| 📊 | **Relatórios e indicadores** | Dashboard analítico com gráficos: receita realizada/prevista, ticket médio, taxa de comparecimento e cancelamento, consultas por dia, por status e por tipo. |
| 🗓️ | **Visão semanal com drag & drop** | Calendário semanal em grade — arraste uma consulta para outro horário e ela é **reagendada na hora**; clique num espaço livre para criar. |
| ⚡ | **Sincronização em tempo real** | Via Supabase Realtime, a agenda, o calendário e o dashboard atualizam **ao vivo** quando outro usuário cria, edita ou cancela algo. Indicador "Ao vivo" no topo. |
| 🔐 | **Verificação em duas etapas (MFA/2FA)** | Autenticação de dois fatores por TOTP (app autenticador). Ativação com QR Code em Configurações e desafio de código no login. |
| 🔔 | **Central de notificações** | Sino funcional que lista, em tempo real, consultas atrasadas, pacientes aguardando, atendimentos em andamento e próximas consultas do dia. |
| 👤 | **Cadastro de conta + login com Google** | Tela de cadastro de novos usuários e autenticação social (Google OAuth). |
| 🛡️ | **Reforços de segurança** | Cabeçalhos de segurança (anti-clickjacking, HSTS, anti-MIME-sniffing), rate limiting nas rotas de IA e Row Level Security em todas as tabelas. |
| 📱 | **Responsividade completa** | Layout fluido para mobile (com menu lateral em gaveta), tablet e desktop. |

---

## ✅ Funcionalidades do MVP

**Autenticação**
- Login com e-mail/senha (sessão real via Supabase Auth).
- Cadastro de conta e login com Google.
- Rotas protegidas — sem sessão, redireciona para o login.

**Calendário / Dashboard**
- Calendário mensal navegável, com destaque do dia atual e do dia selecionado.
- Dias com indicadores (pontos coloridos por status) e contagem de consultas.
- Resumo do dia: total, confirmados, aguardando, finalizados.
- Consultas do dia agrupadas por turno (manhã / tarde / noite).

**Agenda diária**
- Colunas Manhã / Tarde / Noite com contagem por turno.
- Cards de consulta com horário, paciente, tipo, convênio e status.
- Estados visuais: normal, em atendimento, realizado, cancelado, **atrasado**.
- Navegação por data e visão semanal (com drag & drop).

**Agendamentos**
- Novo agendamento (modal) com busca de paciente, cadastro rápido de paciente
  integrado, seleção de horário (slots ocupados/passados bloqueados) e máscara
  de moeda no valor.
- Edição e cancelamento (com motivo) em modais.
- Detalhe da consulta em painel lateral: dados completos, anotação clínica
  com autosave, linha do tempo do histórico e ações (editar, avançar status,
  marcar como realizada, cancelar).

**Pacientes**
- Cadastro com máscaras de CPF e telefone e validações.
- Listagem com busca por nome ou CPF e contagem de consultas.

**Outras telas**
- Consultas — lista geral filtrável por status e busca por paciente.
- Histórico — linha do tempo de todas as ações do sistema.
- Configurações — dados da clínica, funcionamento, fluxo de status e 2FA.
- Página 404 tratada.

Toda ação ocorre **sem reload**, com feedback via toast e atualização
automática de todas as telas.

## 📋 Regras de negócio

- Atendimento das **07:00 às 19:00** em slots de **30 minutos**.
- Fluxo de status: `agendado → confirmado → aguardando → em atendimento →
  realizado`; cancelamento a partir de agendado ou confirmado.
- Não é permitido dois agendamentos no mesmo horário (garantido também por
  índice único no banco); horários ocupados/passados ficam indisponíveis.
- Consultas canceladas e realizadas permanecem visíveis no histórico.
- Consultas em estado final (realizado/cancelado) não podem ser editadas.
- Consultas vencidas (horário passado, ainda não atendidas) recebem o estado
  visual **"Atrasado"**.

## 🛡️ Segurança

- **Autenticação real** com Supabase Auth + verificação em duas etapas (TOTP).
- **Row Level Security** em todas as tabelas (acesso só a usuários autenticados).
- **Cabeçalhos de segurança**: `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
- **Rate limiting** nas rotas de IA.
- Chaves de API processadas **no servidor** — nunca expostas ao cliente.

## 📁 Estrutura do projeto

```
src/
  app/
    login/            Login (e-mail/senha, Google, etapa de 2FA)
    cadastro/         Cadastro de conta
    auth/callback/    Callback do login social (Google)
    (app)/            Área autenticada (sidebar + topbar)
      page.tsx        Calendário / Dashboard
      agenda/         Agenda diária + visão semanal (drag & drop)
      pacientes/      Pacientes
      consultas/      Consultas
      relatorios/     Relatórios e indicadores
      historico/      Histórico de atendimentos
      configuracoes/  Configurações + 2FA
    api/ai/           Route handler — organizar anotação (IA)
    api/chat/         Route handler — assistente virtual (IA)
    not-found.tsx     Página 404
  components/         AppShell, modais, painel de detalhe, semana,
                      chat, notificações, MFA, UI base
  lib/                Supabase client, tipos, hooks, realtime, gemini
  proxy.ts            Proteção de rotas + verificação de MFA
db/
  schema.sql          DDL do banco (tabelas, RLS, realtime)
  seed.sql            Dados de demonstração
```

## ⚙️ Configuração (Supabase / IA / Google)

**1. Banco de dados** — crie um projeto em [supabase.com](https://supabase.com),
e no **SQL Editor** execute `db/schema.sql` e depois `db/seed.sql`.

**2. Variáveis de ambiente** — copie `.env.example` para `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...        # Project Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # Project Settings → API
GEMINI_API_KEY=...                  # opcional — recursos de IA
```

**3. IA (opcional)** — crie uma chave gratuita em
[aistudio.google.com/apikey](https://aistudio.google.com/apikey) e defina
`GEMINI_API_KEY`. Sem ela, o app funciona normalmente; só a IA fica indisponível.

**4. Login com Google (opcional)** — no Google Cloud Console crie credenciais
OAuth e adicione o redirect `https://<seu-projeto>.supabase.co/auth/v1/callback`;
no Supabase, habilite o provedor Google em Authentication → Providers.

## 🧩 Decisões técnicas

- **Supabase** entrega PostgreSQL + Auth + Realtime + MFA prontos, permitindo
  autenticação real e sincronização ao vivo dentro do prazo.
- **React Query** centraliza o cache: cada mutação — e cada evento de tempo
  real — invalida as queries afetadas, mantendo todas as telas atualizadas.
- **Modais e painel de detalhe** controlados por um `UIProvider` global,
  acessível de qualquer tela.
- A **IA** roda em route handlers no servidor, protegidos por sessão e rate
  limiting, sem expor a chave de API ao cliente.
