import { createClient } from "./supabase/client";
import type {
  Appointment,
  AppointmentInput,
  AppointmentStatus,
  HistoryEntry,
  Patient,
  PatientInput,
} from "./types";
import { STATUS_META } from "./constants";

// Cliente Supabase criado sob demanda (lazy). Evita que o build/prerender
// quebre ao avaliar este módulo antes de as variáveis de ambiente existirem.
let _client: ReturnType<typeof createClient> | null = null;
function sb() {
  return (_client ??= createClient());
}

const APPT_SELECT = "*, patient:patients(*)";

async function addHistory(appointmentId: string, action: string) {
  await sb()
    .from("appointment_history")
    .insert({ appointment_id: appointmentId, action });
}

/* ----------------------------- Patients ----------------------------- */

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await sb()
    .from("patients")
    .select("*")
    .order("full_name");
  if (error) throw error;
  return data ?? [];
}

export async function createPatient(input: PatientInput): Promise<Patient> {
  const { data, error } = await sb()
    .from("patients")
    .insert({
      full_name: input.full_name,
      cpf: input.cpf || null,
      phone: input.phone || null,
      birth_date: input.birth_date || null,
      email: input.email || null,
      notes: input.notes || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updatePatient(
  id: string,
  input: PatientInput,
): Promise<Patient> {
  const { data, error } = await sb()
    .from("patients")
    .update({
      full_name: input.full_name,
      cpf: input.cpf || null,
      phone: input.phone || null,
      birth_date: input.birth_date || null,
      email: input.email || null,
      notes: input.notes || null,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/* --------------------------- Appointments --------------------------- */

export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await sb()
    .from("appointments")
    .select(APPT_SELECT)
    .order("date")
    .order("time");
  if (error) throw error;
  return (data ?? []) as Appointment[];
}

export async function getAppointment(id: string): Promise<Appointment> {
  const { data, error } = await sb()
    .from("appointments")
    .select(APPT_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Appointment;
}

export async function getHistory(
  appointmentId: string,
): Promise<HistoryEntry[]> {
  const { data, error } = await sb()
    .from("appointment_history")
    .select("*")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Times already occupied on a date (cancelled slots are free again). */
export async function getBookedTimes(
  date: string,
  excludeId?: string,
): Promise<string[]> {
  const { data, error } = await sb()
    .from("appointments")
    .select("id, time, status")
    .eq("date", date)
    .neq("status", "cancelado");
  if (error) throw error;
  return (data ?? [])
    .filter((r) => r.id !== excludeId)
    .map((r) => (r.time as string).slice(0, 5));
}

export async function createAppointment(
  input: AppointmentInput,
): Promise<Appointment> {
  const { data, error } = await sb()
    .from("appointments")
    .insert({
      patient_id: input.patient_id,
      date: input.date,
      time: input.time,
      duration_min: input.duration_min,
      type: input.type,
      insurance: input.insurance,
      price: input.price,
      notes: input.notes || null,
      status: "agendado",
    })
    .select(APPT_SELECT)
    .single();
  if (error) throw error;
  await addHistory(data.id, "Consulta criada");
  return data as Appointment;
}

export async function updateAppointment(
  id: string,
  input: AppointmentInput,
): Promise<Appointment> {
  const { data, error } = await sb()
    .from("appointments")
    .update({
      patient_id: input.patient_id,
      date: input.date,
      time: input.time,
      duration_min: input.duration_min,
      type: input.type,
      insurance: input.insurance,
      price: input.price,
      notes: input.notes || null,
    })
    .eq("id", id)
    .select(APPT_SELECT)
    .single();
  if (error) throw error;
  await addHistory(id, "Consulta editada");
  return data as Appointment;
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  time: string,
): Promise<void> {
  const { error } = await sb()
    .from("appointments")
    .update({ date, time })
    .eq("id", id);
  if (error) throw error;
  await addHistory(id, "Consulta reagendada");
}

export async function cancelAppointment(
  id: string,
  reason: string,
): Promise<void> {
  const { error } = await sb()
    .from("appointments")
    .update({ status: "cancelado", cancel_reason: reason })
    .eq("id", id);
  if (error) throw error;
  await addHistory(id, `Consulta cancelada: ${reason}`);
}

export async function setStatus(
  id: string,
  status: AppointmentStatus,
): Promise<void> {
  const { error } = await sb()
    .from("appointments")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  await addHistory(id, `Status atualizado para ${STATUS_META[status].label}`);
}

export interface ActivityEntry {
  id: string;
  action: string;
  created_at: string;
  appointment: {
    id: string;
    date: string;
    time: string;
    status: AppointmentStatus;
    type: string;
    patient: { full_name: string } | null;
  } | null;
}

export async function getActivityLog(): Promise<ActivityEntry[]> {
  const { data, error } = await sb()
    .from("appointment_history")
    .select(
      "id, action, created_at, appointment:appointments(id, date, time, status, type, patient:patients(full_name))",
    )
    .order("created_at", { ascending: false })
    .limit(150);
  if (error) throw error;
  return (data ?? []) as unknown as ActivityEntry[];
}

/* ------------------------- Anexos ------------------------- */

export interface PatientAttachment {
  id: string;
  patient_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export async function getAttachments(
  patientId: string,
): Promise<PatientAttachment[]> {
  const { data, error } = await sb()
    .from("patient_attachments")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadAttachment(
  patientId: string,
  file: File,
): Promise<void> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${patientId}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await sb()
    .storage.from("anexos")
    .upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;
  const { error } = await sb().from("patient_attachments").insert({
    patient_id: patientId,
    file_name: file.name,
    file_path: path,
    file_size: file.size,
    mime_type: file.type,
  });
  if (error) throw error;
}

export async function deleteAttachment(
  attachment: PatientAttachment,
): Promise<void> {
  await sb().storage.from("anexos").remove([attachment.file_path]);
  const { error } = await sb()
    .from("patient_attachments")
    .delete()
    .eq("id", attachment.id);
  if (error) throw error;
}

export async function getAttachmentUrl(path: string): Promise<string> {
  const { data, error } = await sb()
    .storage.from("anexos")
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

/* --------------------------- Conta / perfil --------------------------- */

export async function getCurrentUser() {
  const { data } = await sb().auth.getUser();
  return data.user;
}

/** Envia uma nova foto de perfil e a grava no metadata do usuário. */
export async function uploadAvatar(file: File): Promise<string> {
  const { data: userData } = await sb().auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("Sessão expirada.");

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await sb()
    .storage.from("avatars")
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = sb().storage.from("avatars").getPublicUrl(path);

  const { error } = await sb().auth.updateUser({
    data: { avatar_url: publicUrl },
  });
  if (error) throw error;

  return publicUrl;
}

export async function saveClinicalNotes(
  id: string,
  text: string,
): Promise<void> {
  const { error } = await sb()
    .from("appointments")
    .update({ clinical_notes: text })
    .eq("id", id);
  if (error) throw error;
  await addHistory(id, "Anotação clínica atualizada");
}
