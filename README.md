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

> O arquivo `.env.local` (credenciais do Supabase) **não é versionado** por
> segurança. Antes de rodar, copie `.env.example` para `.env.local` e preencha
> com a *URL* e a *anon key* do seu projeto Supabase — veja a seção
> "Usar seu próprio projeto Supabase" abaixo.

---

## Stack

| Camada        | Tecnologia                                       |
| ------------- | ------------------------------------------------ |
| Framework     | Next.js 16 (App Router) + React 19 + TypeScript  |
| Estilo        | TailwindCSS v4                                   |
| Backend / BD  | Supabase (PostgreSQL + Auth)                     |
| Dados (cache) | TanStack Query (React Query)                     |
| Ícones        | lucide-react                                     |

## Funcionalidades

- **Login e autenticação** — sessão real via Supabase Auth, rotas protegidas.
- **Calendário / Dashboard** — calendário mensal navegável, indicadores do dia
  (KPIs) e consultas do dia agrupadas por turno.
- **Agenda diária** — colunas Manhã / Tarde / Noite com todos os estados
  visuais (normal, em atendimento, realizado, cancelado, atrasado).
- **Novo agendamento** — modal com busca de paciente, cadastro rápido de
  paciente integrado, e seleção de horário (slots ocupados/passados bloqueados).
- **Cadastro de pacientes** — com máscaras de CPF e telefone e validações.
- **Detalhe da consulta** — painel lateral com dados, anotação clínica
  (autosave), histórico e ações (editar, avançar status, marcar realizada).
- **Edição e cancelamento** — modais com feedback e motivo de cancelamento.
- **Consultas** — lista filtrável por status e busca por paciente.
- **Histórico** — linha do tempo de todas as ações do sistema.
- **Configurações** e **página 404**.

Toda ação é feita **sem reload**, com feedback via toast e atualização
automática de calendário, agenda e dashboard.

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
    login/            Tela de login
    (app)/            Área autenticada (sidebar + topbar)
      page.tsx        Calendário / Dashboard
      agenda/         Agenda diária
      pacientes/      Pacientes
      consultas/      Consultas
      historico/      Histórico de atendimentos
      configuracoes/  Configurações
    not-found.tsx     Página 404
  components/         AppShell, modais, painel de detalhe, UI base
  lib/                Supabase client, tipos, hooks (React Query), regras
  proxy.ts            Proteção de rotas (autenticação)
db/
  schema.sql          DDL do banco
  seed.sql            Dados de demonstração
```

## Usar seu próprio projeto Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute `db/schema.sql` e depois `db/seed.sql`.
3. Em **Project Settings → API**, copie a *Project URL* e a *anon key*.
4. Crie um arquivo `.env.local` (use `.env.example` como base) com esses valores.
5. `npm run dev`.

## Decisões técnicas

- **Supabase** foi escolhido como backend por entregar PostgreSQL + Auth
  prontos, permitindo autenticação real dentro do prazo.
- **React Query** centraliza o cache: cada mutação invalida as queries
  afetadas, garantindo que todas as telas reflitam o dado atualizado sem reload.
- **Row Level Security** ativo em todas as tabelas (acesso restrito a usuários
  autenticados).
- **Modais e painel de detalhe** são controlados por um `UIProvider` global,
  acessível de qualquer tela.
