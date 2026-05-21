-- ============================================================
-- MedSchedule — Schema do banco de dados (PostgreSQL / Supabase)
-- Execute este arquivo no SQL Editor do Supabase.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------- Pacientes -------------------------
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  cpf text,
  phone text,
  birth_date date,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

-- ------------------------ Consultas --------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  date date not null,
  time time not null,
  duration_min int not null default 30,
  type text not null,
  insurance text not null,
  price numeric(10,2) not null default 0,
  status text not null default 'agendado'
    check (status in ('agendado','confirmado','aguardando','em_atendimento','realizado','cancelado')),
  notes text,
  clinical_notes text,
  cancel_reason text,
  created_at timestamptz not null default now()
);

-- Impede dois agendamentos no mesmo horário.
-- Consultas canceladas liberam o slot novamente.
create unique index appointments_slot_unique
  on public.appointments (date, time)
  where status <> 'cancelado';

create index appointments_date_idx on public.appointments (date);
create index appointments_patient_idx on public.appointments (patient_id);

-- ----------------- Histórico das consultas -------------------
create table public.appointment_history (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);

create index appointment_history_appt_idx on public.appointment_history (appointment_id);

-- ------------------- Row Level Security ----------------------
-- Aplicativo de clínica única: qualquer usuário autenticado
-- tem acesso completo aos dados.
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_history enable row level security;

create policy "authenticated full access" on public.patients
  for all to authenticated using (true) with check (true);
create policy "authenticated full access" on public.appointments
  for all to authenticated using (true) with check (true);
create policy "authenticated full access" on public.appointment_history
  for all to authenticated using (true) with check (true);
