-- ============================================================
-- MedSchedule: Dados de demonstração
-- Execute DEPOIS de schema.sql, no SQL Editor do Supabase.
-- As datas são relativas a CURRENT_DATE, então a agenda fica
-- sempre preenchida em torno de "hoje".
-- ============================================================

-- ------------------ Usuário de demonstração ------------------
-- Login do app:  doutor@clinica.com.br  /  medschedule123
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'doutor@clinica.com.br',
  crypt('medschedule123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Dra. Helena Martins"}',
  '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, u.id::text,
  json_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.email = 'doutor@clinica.com.br';

-- ------------------------ Pacientes --------------------------
insert into public.patients (full_name, cpf, phone, birth_date, email, notes) values
('Mariana Costa','312.456.789-01','(11) 98765-4321','1996-04-12','mariana.costa@email.com','Paciente com histórico de cefaleia tensional.'),
('Carlos Eduardo Mendes','423.567.890-12','(11) 99812-3456','1981-09-23','carlos.mendes@email.com',null),
('Ana Paula Silva','534.678.901-23','(11) 97654-3210','1990-01-30','ana.silva@email.com','Alergia a dipirona.'),
('Roberto Alves','645.789.012-34','(21) 98123-4567','1975-11-05','roberto.alves@email.com',null),
('Fernanda Lima','756.890.123-45','(11) 96543-2109','1988-07-19','fernanda.lima@email.com','Acompanhamento de pressão arterial.'),
('Lucas Ferreira','867.901.234-56','(11) 99234-5678','2001-03-08','lucas.ferreira@email.com',null),
('Camila Rocha','978.012.345-67','(11) 98456-7890','1993-12-15','camila.rocha@email.com',null),
('Beatriz Oliveira','189.123.456-78','(31) 97890-1234','1985-06-27','beatriz.oliveira@email.com','Gestante - 2º trimestre.'),
('João Pedro Santos','290.234.567-89','(11) 96321-0987','1999-10-02','joao.santos@email.com',null),
('Patrícia Gomes','301.345.678-90','(11) 98012-3456','1970-02-14','patricia.gomes@email.com','Diabetes tipo 2.'),
('Rafael Nunes','412.456.789-01','(11) 99456-7821','1983-08-11','rafael.nunes@email.com',null),
('Juliana Almeida','523.567.890-12','(21) 97123-9876','1995-05-21','juliana.almeida@email.com','Primeira vez na clínica.');

-- ------------------------ Consultas --------------------------
insert into public.appointments
  (patient_id, date, time, duration_min, type, insurance, price, status, notes, clinical_notes, cancel_reason)
select p.id, v.date, v.time, v.duration_min, v.type, v.insurance, v.price, v.status, v.notes, v.clinical_notes, v.cancel_reason
from (values
  ('Carlos Eduardo Mendes', current_date, time '08:00', 30, 'Primeira Consulta', 'Unimed', 250.00, 'realizado', null::text, 'Paciente em bom estado geral. Solicitados exames de rotina.'::text, null::text),
  ('Ana Paula Silva', current_date, time '08:30', 30, 'Retorno', 'Unimed', 180.00, 'realizado', null, 'Evolução favorável. Mantida a conduta atual.', null),
  ('Mariana Costa', current_date, time '09:30', 45, 'Exame de Rotina', 'Bradesco Saúde', 320.00, 'em_atendimento', 'Paciente relatou dores leves de cabeça na última semana.', null, null),
  ('Roberto Alves', current_date, time '11:00', 30, 'Acompanhamento', 'SulAmérica', 200.00, 'aguardando', null, null, null),
  ('Fernanda Lima', current_date, time '14:00', 30, 'Retorno', 'Particular', 220.00, 'agendado', 'Trazer aferições de pressão da semana.', null, null),
  ('João Pedro Santos', current_date, time '15:00', 30, 'Primeira Consulta', 'Unimed', 250.00, 'cancelado', null, null, 'Paciente solicitou remarcação por motivos pessoais.'),
  ('Beatriz Oliveira', current_date, time '16:30', 45, 'Avaliação', 'Amil', 300.00, 'confirmado', null, null, null),
  ('Lucas Ferreira', current_date, time '18:00', 30, 'Retorno', 'SulAmérica', 180.00, 'confirmado', null, null, null),
  ('Patrícia Gomes', current_date - 1, time '09:00', 30, 'Consulta de Rotina', 'Particular', 200.00, 'realizado', null, 'Glicemia controlada. Retorno em 3 meses.', null),
  ('Rafael Nunes', current_date - 1, time '10:00', 30, 'Retorno', 'Unimed', 180.00, 'realizado', null, 'Alta do acompanhamento.', null),
  ('Juliana Almeida', current_date - 1, time '14:00', 45, 'Avaliação', 'Amil', 300.00, 'realizado', null, 'Encaminhada para avaliação com especialista.', null),
  ('Camila Rocha', current_date - 1, time '15:30', 30, 'Primeira Consulta', 'Bradesco Saúde', 250.00, 'cancelado', null, null, 'Falta não justificada.'),
  ('Mariana Costa', current_date + 1, time '08:00', 30, 'Retorno', 'Bradesco Saúde', 200.00, 'confirmado', null, null, null),
  ('Carlos Eduardo Mendes', current_date + 1, time '09:00', 30, 'Acompanhamento', 'Unimed', 180.00, 'agendado', null, null, null),
  ('Ana Paula Silva', current_date + 1, time '10:30', 45, 'Exame de Rotina', 'Unimed', 320.00, 'agendado', null, null, null),
  ('Roberto Alves', current_date + 1, time '14:00', 30, 'Retorno', 'SulAmérica', 180.00, 'agendado', null, null, null),
  ('Fernanda Lima', current_date + 2, time '09:00', 30, 'Primeira Consulta', 'Particular', 250.00, 'agendado', null, null, null),
  ('Lucas Ferreira', current_date + 2, time '11:00', 45, 'Avaliação', 'SulAmérica', 300.00, 'confirmado', null, null, null),
  ('Beatriz Oliveira', current_date + 2, time '16:00', 30, 'Retorno', 'Amil', 200.00, 'agendado', null, null, null),
  ('João Pedro Santos', current_date + 3, time '08:30', 30, 'Consulta de Rotina', 'Unimed', 200.00, 'agendado', null, null, null),
  ('Patrícia Gomes', current_date + 3, time '10:00', 30, 'Retorno', 'Particular', 180.00, 'agendado', null, null, null),
  ('Rafael Nunes', current_date + 5, time '09:30', 30, 'Acompanhamento', 'Unimed', 180.00, 'agendado', null, null, null),
  ('Juliana Almeida', current_date + 5, time '14:30', 30, 'Primeira Consulta', 'Amil', 250.00, 'confirmado', null, null, null),
  ('Mariana Costa', current_date + 7, time '10:00', 45, 'Retorno', 'Bradesco Saúde', 200.00, 'agendado', null, null, null),
  ('Camila Rocha', current_date + 7, time '15:00', 30, 'Avaliação', 'Bradesco Saúde', 280.00, 'agendado', null, null, null),
  ('Carlos Eduardo Mendes', current_date + 9, time '08:00', 30, 'Retorno', 'Unimed', 180.00, 'agendado', null, null, null)
) as v(patient_name, date, time, duration_min, type, insurance, price, status, notes, clinical_notes, cancel_reason)
join public.patients p on p.full_name = v.patient_name;

-- -------------------- Histórico inicial ----------------------
insert into public.appointment_history (appointment_id, action, created_at)
select id, 'Consulta criada', created_at from public.appointments;

insert into public.appointment_history (appointment_id, action)
select id, 'Status atualizado para Confirmado' from public.appointments
where status in ('confirmado','aguardando','em_atendimento','realizado');

insert into public.appointment_history (appointment_id, action)
select id, 'Consulta cancelada' from public.appointments where status = 'cancelado';

insert into public.appointment_history (appointment_id, action)
select id, 'Consulta marcada como realizada' from public.appointments where status = 'realizado';
