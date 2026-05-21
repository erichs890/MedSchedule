"use client";

import { useRouter } from "next/navigation";
import {
  Building2,
  Clock,
  CalendarRange,
  LogOut,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { TIME_SLOTS } from "@/lib/constants";

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <div className="mb-4 flex items-center gap-2.5 border-b border-line pb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

export default function ConfiguracoesPage() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-5 lg:p-7">
      <div>
        <h2 className="text-lg font-semibold text-ink">Configurações</h2>
        <p className="text-sm text-ink-soft">
          Informações da clínica e preferências do sistema.
        </p>
      </div>

      <Card icon={<Building2 className="h-4.5 w-4.5" />} title="Clínica">
        <Row label="Nome" value="Clínica Bela Vida" />
        <Row label="Especialidade" value="Clínica Geral" />
        <Row label="Responsável" value="Dra. Helena Martins" />
      </Card>

      <Card
        icon={<Clock className="h-4.5 w-4.5" />}
        title="Funcionamento da agenda"
      >
        <Row label="Horário de atendimento" value="07:00 às 19:00" />
        <Row label="Duração dos slots" value="30 minutos" />
        <Row
          label="Horários disponíveis"
          value={`${TIME_SLOTS.length} por dia`}
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TIME_SLOTS.map((s) => (
            <span
              key={s}
              className="rounded-md bg-slate-100 px-2 py-1 text-xs tabular-nums text-ink-soft"
            >
              {s}
            </span>
          ))}
        </div>
      </Card>

      <Card
        icon={<CalendarRange className="h-4.5 w-4.5" />}
        title="Fluxo de status das consultas"
      >
        <p className="text-sm text-ink-soft">
          Agendado → Confirmado → Aguardando → Em atendimento → Realizado.
          Consultas podem ser canceladas a partir de Agendado ou Confirmado.
          Consultas finalizadas não podem ser alteradas.
        </p>
      </Card>

      <Card icon={<ShieldCheck className="h-4.5 w-4.5" />} title="Conta">
        <Row label="E-mail" value="doutor@clinica.com.br" />
        <Row label="Perfil" value="Administrador" />
        <div className="mt-3 border-t border-line pt-3">
          <Button variant="danger" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sair do sistema
          </Button>
        </div>
      </Card>

      <p className="flex items-center justify-center gap-1.5 pt-2 text-xs text-ink-muted">
        <Stethoscope className="h-3.5 w-3.5" />
        MedSchedule · MVP · Sistema de agenda médica
      </p>
    </div>
  );
}
