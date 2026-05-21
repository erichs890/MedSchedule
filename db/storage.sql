-- ============================================================
-- MedSchedule: Anexos do paciente (prontuário)
-- Execute no SQL Editor do Supabase para habilitar o upload de
-- exames e documentos na ficha do paciente.
-- ============================================================

-- Tabela de metadados dos anexos
create table if not exists public.patient_attachments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create index if not exists patient_attachments_patient_idx
  on public.patient_attachments (patient_id);

alter table public.patient_attachments enable row level security;

create policy "authenticated full access" on public.patient_attachments
  for all to authenticated using (true) with check (true);

-- Bucket de Storage (privado) para os arquivos
insert into storage.buckets (id, name, public)
values ('anexos', 'anexos', false)
on conflict (id) do nothing;

-- Acesso ao bucket restrito a usuários autenticados
create policy "anexos: leitura autenticada" on storage.objects
  for select to authenticated using (bucket_id = 'anexos');
create policy "anexos: upload autenticado" on storage.objects
  for insert to authenticated with check (bucket_id = 'anexos');
create policy "anexos: exclusão autenticada" on storage.objects
  for delete to authenticated using (bucket_id = 'anexos');

-- Bucket público para fotos de perfil dos usuários
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars: leitura pública" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars: upload autenticado" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars');
create policy "avatars: atualização autenticada" on storage.objects
  for update to authenticated using (bucket_id = 'avatars');
