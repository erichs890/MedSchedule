# MedSchedule — Sistema de Agenda Médica

Sistema de agenda médica para clínicas pequenas e consultórios. Centraliza
agendamentos, gestão de pacientes, acompanhamento de consultas e histórico de
atendimentos — substituindo papel, planilhas e agendas físicas.

Desafio técnico desenvolvido com **Next.js + TypeScript + TailwindCSS +
Supabase**, seguindo o design system "Clinical Precision" do protótipo.

---

## Acesso de demonstração

```
E-mail:  doutor@clinica.com.br
Senha:   medschedule123
```

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

> O arquivo `.env.local` (credenciais) **não é versionado** por segurança.
> Antes de rodar, copie `.env.example` para `.env.local` e preencha com a
> *URL* e a *anon key* do seu projeto Supabase — veja "Usar seu próprio
> projeto Supabase" abaixo.

---

## Stack

| Camada        | Tecnologia                                       |
| ------------- | ------------------------------------------------ |
| Framework     | Next.js 16 (App Router) + React 19 + TypeScript  |
| Estilo        | TailwindCSS v4                                   |
| Backend / BD  | Supabase (PostgreSQL + Auth + Realtime)          |
| Dados (cache) | TanStack Query (React Query)                     |
| Gráficos      | Recharts                                         |
| IA            | Google Gemini                                    |
| Ícones        | lucide-react                                     |

## Funcionalidades

**Escopo do MVP**
- **Login e autenticação** — sessão real via Supabase Auth, rotas protegidas.
- **Calendário / Dashboard** — calendário mensal navegável, indicadores do dia
  e consultas do dia agrupadas por turno.
- **Agenda diária** — colunas Manhã / Tarde / Noite com todos os estados
  visuais (normal, em atendimento, realizado, cancelado, atrasado).
- **Novo agendamento** — modal com busca de paciente, cadastro rápido de
  paciente integrado e seleção de horário (slots ocupados/passados bloqueados).
- **Cadastro de pacientes** — com máscaras de CPF e telefone e validações.
- **Detalhe da consulta** — painel lateral com dados, anotação clínica,
  histórico e ações (editar, avançar status, marcar realizada).
- **Edição e cancelamento** — modais com feedback e motivo de cancelamento.
- **Consultas**, **Histórico**, **Configurações** e **página 404**.

**Diferenciais (além do pedido)**
- **🧠 IA na anotação clínica** — botão "Organizar com IA" reescreve a anotação
  livre em formato clínico estruturado (Gemini).
- **💬 Assistente virtual (Sofia)** — chatbot com IA que responde dúvidas sobre
  a clínica, convênios e uso do sistema.
- **📊 Relatórios e indicadores** — dashboard analítico com gráficos: receita,
  ticket médio, comparecimento, cancelamento, consultas por dia/status/tipo.
- **🗓️ Visão semanal com drag & drop** — calendário semanal; arraste uma
  consulta para outro horário para reagendar.
- **⚡ Sincronização em tempo real** — via Supabase Realtime, a agenda atualiza
  ao vivo entre usuários simultâneos.
- **🔐 Verificação em duas etapas (2FA)** — MFA por TOTP (app autenticador),
  com ativação em Configurações e desafio no login.

**Segurança**
- Row Level Security em todas as tabelas.
- MFA/2FA opcional por usuário.
- Cabeçalhos de segurança (anti clickjacking, MIME-sniffing, HSTS).
- Rate limiting nas rotas de IA. Chaves de API nunca expostas ao cliente.

Toda ação é feita **sem reload**, com feedback via toast. Interface
responsiva (mobile, tablet e desktop).

## Regras de negócio

- Atendimento das **07:00 às 19:00** em slots de **30 minutos**.
- Fluxo de status: `agendado → confirmado → aguardando → em atendimento →
  realizado`; cancelamento a partir de agendado/confirmado.
- Não é possível ter dois agendamentos no mesmo horário (garantido também por
  índice único no banco); horários ocupados/passados ficam indisponíveis.
- Consultas canceladas e realizadas permanecem visíveis no histórico.
- Consultas em estado final (realizado/cancelado) não podem ser editadas.
- Consultas vencidas (horário passado, ainda não atendidas) recebem o estado
  visual **"Atrasado"**.

## Estrutura do projeto

```
src/
  app/
    login/            Tela de login (com etapa de 2FA)
    (app)/            Área autenticada (sidebar + topbar)
      page.tsx        Calendário / Dashboard
      agenda/         Agenda diária + visão semanal
      pacientes/      Pacientes
      consultas/      Consultas
      relatorios/     Relatórios e indicadores
      historico/      Histórico de atendimentos
      configuracoes/  Configurações + 2FA
    api/ai/           Route handler — organizar anotação (IA)
    api/chat/         Route handler — assistente virtual (IA)
    not-found.tsx     Página 404
  components/         AppShell, modais, painel de detalhe, semana,
                      chat, MFA, UI base
  lib/                Supabase client, tipos, hooks, realtime, gemini
  proxy.ts            Proteção de rotas + verificação de MFA
db/
  schema.sql          DDL do banco (tabelas, RLS, realtime)
  seed.sql            Dados de demonstração
```

## Usar seu próprio projeto Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute `db/schema.sql` e depois `db/seed.sql`.
   O `schema.sql` já habilita o **Realtime** nas tabelas.
3. Em **Project Settings → API**, copie a *Project URL* e a *anon key*.
4. Crie um arquivo `.env.local` (use `.env.example` como base) com esses valores.
5. `npm run dev`.

### Recursos de IA (opcional)

Para ativar o assistente virtual e a organização da anotação clínica, defina
`GEMINI_API_KEY` no `.env.local` (chave gratuita em
[aistudio.google.com/apikey](https://aistudio.google.com/apikey)). Sem a chave,
o app funciona normalmente — apenas a IA fica indisponível.

## Decisões técnicas

- **Supabase** entrega PostgreSQL + Auth + Realtime + MFA prontos, permitindo
  autenticação real e sincronização ao vivo dentro do prazo.
- **React Query** centraliza o cache: cada mutação (e cada evento de tempo
  real) invalida as queries afetadas, mantendo todas as telas atualizadas.
- **Modais e painel de detalhe** são controlados por um `UIProvider` global.
- A **IA** roda em route handlers no servidor, protegidos por sessão e rate
  limiting, sem expor a chave ao cliente.
