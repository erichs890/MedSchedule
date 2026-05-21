"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Wallet,
  Receipt,
  CalendarCheck,
  UserCheck,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui";
import { useAppointments } from "@/lib/hooks";
import { STATUS_HEX, STATUS_META } from "@/lib/constants";
import { addDays, formatCurrency, parseDate, todayISO } from "@/lib/format";
import type { AppointmentStatus } from "@/lib/types";

const STATUS_ORDER: AppointmentStatus[] = [
  "agendado",
  "confirmado",
  "aguardando",
  "em_atendimento",
  "realizado",
  "cancelado",
];

export default function RelatoriosPage() {
  const { data: appointments, isLoading } = useAppointments();

  const m = useMemo(() => {
    const appts = appointments ?? [];
    const realized = appts.filter((a) => a.status === "realizado");
    const cancelled = appts.filter((a) => a.status === "cancelado");
    const revenue = realized.reduce((s, a) => s + Number(a.price), 0);
    const forecast = appts
      .filter((a) => a.status !== "cancelado")
      .reduce((s, a) => s + Number(a.price), 0);
    const ticket = realized.length ? revenue / realized.length : 0;
    const closed = realized.length + cancelled.length;
    const attendance = closed ? realized.length / closed : 0;
    const cancelRate = appts.length ? cancelled.length / appts.length : 0;

    // Últimos 14 dias
    const today = todayISO();
    const days: { iso: string; label: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const iso = addDays(today, -i);
      const d = parseDate(iso);
      days.push({
        iso,
        label: `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1,
        ).padStart(2, "0")}`,
      });
    }
    const daily = days.map((day) => {
      const ofDay = appts.filter((a) => a.date === day.iso);
      return {
        label: day.label,
        consultas: ofDay.length,
        receita: ofDay
          .filter((a) => a.status === "realizado")
          .reduce((s, a) => s + Number(a.price), 0),
      };
    });

    // Distribuição por status
    const statusDist = STATUS_ORDER.map((s) => ({
      key: s,
      name: STATUS_META[s].label,
      value: appts.filter((a) => a.status === s).length,
    })).filter((x) => x.value > 0);

    // Por tipo de consulta
    const typeMap = new Map<string, number>();
    for (const a of appts) typeMap.set(a.type, (typeMap.get(a.type) ?? 0) + 1);
    const byType = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: appts.length,
      revenue,
      forecast,
      ticket,
      attendance,
      cancelRate,
      realizedCount: realized.length,
      daily,
      statusDist,
      byType,
    };
  }, [appointments]);

  if (isLoading) {
    return (
      <div className="space-y-5 p-5 lg:p-7">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5 lg:p-7">
      <div>
        <h2 className="text-lg font-semibold text-ink">
          Relatórios e indicadores
        </h2>
        <p className="text-sm text-ink-soft">
          Visão analítica da operação da clínica.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi
          icon={<Wallet className="h-4 w-4" />}
          label="Receita realizada"
          value={formatCurrency(m.revenue)}
          tone="text-emerald-600 dark:text-emerald-300"
        />
        <Kpi
          icon={<TrendingUp className="h-4 w-4" />}
          label="Receita prevista"
          value={formatCurrency(m.forecast)}
          tone="text-primary"
        />
        <Kpi
          icon={<Receipt className="h-4 w-4" />}
          label="Ticket médio"
          value={formatCurrency(m.ticket)}
          tone="text-ink"
        />
        <Kpi
          icon={<UserCheck className="h-4 w-4" />}
          label="Comparecimento"
          value={`${Math.round(m.attendance * 100)}%`}
          tone="text-sky-600 dark:text-sky-300"
        />
        <Kpi
          icon={<XCircle className="h-4 w-4" />}
          label="Cancelamento"
          value={`${Math.round(m.cancelRate * 100)}%`}
          tone="text-rose-600 dark:text-rose-300"
        />
      </div>

      {/* Consultas por dia */}
      <Card title="Consultas nos últimos 14 dias" icon={<CalendarCheck className="h-4 w-4" />}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={m.daily} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(99,102,241,0.12)" }}
              contentStyle={tooltipStyle}
              labelStyle={{ color: "#0f172a", fontWeight: 600 }}
            />
            <Bar
              dataKey="consultas"
              fill="#4f46e5"
              radius={[6, 6, 0, 0]}
              maxBarSize={34}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Receita por dia */}
        <Card title="Receita realizada nos últimos 14 dias" icon={<Wallet className="h-4 w-4" />}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={m.daily} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={(v) => `R$${v}`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Receita",
                ]}
              />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição por status */}
        <Card title="Distribuição por status" icon={<CalendarCheck className="h-4 w-4" />}>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie
                  data={m.statusDist}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={84}
                  paddingAngle={2}
                  stroke="none"
                >
                  {m.statusDist.map((s) => (
                    <Cell key={s.key} fill={STATUS_HEX[s.key]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex-1 space-y-2">
              {m.statusDist.map((s) => (
                <li key={s.key} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: STATUS_HEX[s.key] }}
                  />
                  <span className="flex-1 text-ink-soft">{s.name}</span>
                  <span className="font-semibold tabular-nums text-ink">
                    {s.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* Por tipo */}
      <Card title="Consultas por tipo" icon={<CalendarCheck className="h-4 w-4" />}>
        <ResponsiveContainer width="100%" height={Math.max(200, m.byType.length * 44)}>
          <BarChart
            data={m.byType}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 4, left: 24 }}
          >
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="type"
              width={130}
              tick={{ fontSize: 12, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: "rgba(99,102,241,0.12)" }} contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
  fontSize: 13,
};

function Kpi({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className={`flex items-center gap-1.5 ${tone}`}>
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-center gap-2 text-ink">
        <span className="text-primary">{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}
