"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as data from "./data";
import type {
  Appointment,
  AppointmentInput,
  AppointmentStatus,
  PatientInput,
} from "./types";

/* ------------------------------ Queries ----------------------------- */

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: data.getAppointments,
  });
}

export function useAppointment(id: string | null) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => data.getAppointment(id!),
    enabled: !!id,
  });
}

export function useHistory(id: string | null) {
  return useQuery({
    queryKey: ["history", id],
    queryFn: () => data.getHistory(id!),
    enabled: !!id,
  });
}

export function usePatients() {
  return useQuery({ queryKey: ["patients"], queryFn: data.getPatients });
}

export function useActivityLog() {
  return useQuery({ queryKey: ["activity"], queryFn: data.getActivityLog });
}

export function useBookedTimes(date: string, excludeId?: string) {
  return useQuery({
    queryKey: ["bookedTimes", date, excludeId ?? null],
    queryFn: () => data.getBookedTimes(date, excludeId),
    enabled: !!date,
  });
}

/* ----------------------------- Mutations ----------------------------- */

/** Invalidate every appointment-related cache so the whole app refreshes. */
function useApptInvalidator() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["appointments"] });
    qc.invalidateQueries({ queryKey: ["appointment"] });
    qc.invalidateQueries({ queryKey: ["history"] });
    qc.invalidateQueries({ queryKey: ["activity"] });
    qc.invalidateQueries({ queryKey: ["bookedTimes"] });
  };
}

export function useCreateAppointment() {
  const invalidate = useApptInvalidator();
  return useMutation({
    mutationFn: (input: AppointmentInput) => data.createAppointment(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAppointment() {
  const invalidate = useApptInvalidator();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AppointmentInput }) =>
      data.updateAppointment(id, input),
    onSuccess: invalidate,
  });
}

export function useRescheduleAppointment() {
  const invalidate = useApptInvalidator();
  return useMutation({
    mutationFn: ({
      id,
      date,
      time,
    }: {
      id: string;
      date: string;
      time: string;
    }) => data.rescheduleAppointment(id, date, time),
    onSuccess: invalidate,
  });
}

export function useCancelAppointment() {
  const invalidate = useApptInvalidator();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      data.cancelAppointment(id, reason),
    onSuccess: invalidate,
  });
}

export function useSetStatus() {
  const invalidate = useApptInvalidator();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      data.setStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useSaveClinicalNotes() {
  const invalidate = useApptInvalidator();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      data.saveClinicalNotes(id, text),
    onSuccess: invalidate,
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PatientInput) => data.createPatient(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PatientInput }) =>
      data.updatePatient(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export type { Appointment };
