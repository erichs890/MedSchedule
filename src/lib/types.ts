export type AppointmentStatus =
  | "agendado"
  | "confirmado"
  | "aguardando"
  | "em_atendimento"
  | "realizado"
  | "cancelado";

export interface Patient {
  id: string;
  full_name: string;
  cpf: string | null;
  phone: string | null;
  birth_date: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  date: string;
  time: string;
  duration_min: number;
  type: string;
  insurance: string;
  price: number;
  status: AppointmentStatus;
  notes: string | null;
  clinical_notes: string | null;
  cancel_reason: string | null;
  created_at: string;
  patient?: Patient;
}

export interface HistoryEntry {
  id: string;
  appointment_id: string;
  action: string;
  created_at: string;
}

export interface PatientInput {
  full_name: string;
  cpf: string;
  phone: string;
  birth_date: string;
  email: string;
  notes: string;
}

export interface AppointmentInput {
  patient_id: string;
  date: string;
  time: string;
  duration_min: number;
  type: string;
  insurance: string;
  price: number;
  notes: string;
}
