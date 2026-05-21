"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, UserPlus, Users, Mail, Phone, CalendarPlus } from "lucide-react";
import { Avatar, Button, EmptyState, Skeleton } from "@/components/ui";
import { useUI } from "@/components/UIProvider";
import { useAppointments, usePatients } from "@/lib/hooks";
import { calcAge } from "@/lib/format";

function PacientesContent() {
  const params = useSearchParams();
  const { data: patients, isLoading } = usePatients();
  const { data: appointments } = useAppointments();
  const { openPatient, openNew } = useUI();
  const [query, setQuery] = useState(params.get("q") ?? "");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of appointments ?? []) {
      map.set(a.patient_id, (map.get(a.patient_id) ?? 0) + 1);
    }
    return map;
  }, [appointments]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (patients ?? []).filter(
      (p) =>
        !q ||
        p.full_name.toLowerCase().includes(q) ||
        (p.cpf ?? "").includes(q),
    );
  }, [patients, query]);

  return (
    <div className="space-y-5 p-5 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou CPF..."
            className="h-10 w-72 rounded-lg border border-line bg-white pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <Button onClick={() => openPatient()}>
          <UserPlus className="h-4 w-4" />
          Novo paciente
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white">
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="Nenhum paciente encontrado"
            description="Cadastre um novo paciente para começar."
            action={
              <Button size="sm" onClick={() => openPatient()}>
                <UserPlus className="h-4 w-4" />
                Cadastrar paciente
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => {
            const age = calcAge(p.birth_date);
            return (
              <div
                key={p.id}
                className="flex flex-col rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-md hover:shadow-slate-900/5"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={p.full_name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">
                      {p.full_name}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {p.cpf || "CPF não informado"}
                      {age != null && ` · ${age} anos`}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                    {counts.get(p.id) ?? 0} consultas
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-ink-soft">
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-ink-muted" />
                    {p.phone || "—"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-ink-muted" />
                    <span className="truncate">{p.email || "—"}</span>
                  </p>
                </div>

                <div className="mt-3 flex gap-2 border-t border-line pt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => openPatient(p)}
                  >
                    Ver / Editar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => openNew()}
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Agendar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PacientesPage() {
  return (
    <Suspense fallback={null}>
      <PacientesContent />
    </Suspense>
  );
}
