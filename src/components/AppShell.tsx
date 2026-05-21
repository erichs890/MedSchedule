"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Users,
  Stethoscope,
  History,
  Settings,
  Plus,
  Search,
  Bell,
  LogOut,
  CalendarHeart,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUI } from "./UIProvider";
import { Avatar, Button, cn } from "./ui";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/", label: "Calendário", icon: CalendarDays },
  { href: "/agenda", label: "Agenda do dia", icon: ClipboardList },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/consultas", label: "Consultas", icon: Stethoscope },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({
  children,
  userName,
  userEmail,
}: {
  children: ReactNode;
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { openNew } = useUI();
  const [search, setSearch] = useState("");

  const current = NAV.find((n) => isActive(pathname, n.href));

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(
      search.trim()
        ? `/pacientes?q=${encodeURIComponent(search.trim())}`
        : "/pacientes",
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-[76px] shrink-0 flex-col bg-sidebar lg:w-64">
        {/* Logo */}
        <div className="flex h-[68px] items-center gap-2.5 px-4 lg:px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
            <CalendarHeart className="h-5 w-5" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-bold leading-tight text-white">
              MedSchedule
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Medical SaaS
            </p>
          </div>
        </div>

        {/* New appointment */}
        <div className="px-3 pb-2 pt-1 lg:px-4">
          <button
            onClick={() => openNew()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">Novo Agendamento</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 lg:px-4">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                  active
                    ? "bg-primary text-white"
                    : "text-slate-300 hover:bg-sidebar-soft hover:text-white",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3 lg:p-4">
          {/* Expandido (desktop) */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                Clínica Bela Vida
              </p>
              <p className="truncate text-xs text-slate-400">{userEmail}</p>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-sidebar-soft hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          {/* Colapsado (tablet) */}
          <button
            onClick={logout}
            title="Sair"
            className="flex w-full items-center justify-center rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-sidebar-soft hover:text-white lg:hidden"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-line bg-white px-5 lg:px-8">
          <div className="flex items-center gap-2.5">
            {current && (
              <current.icon className="h-5 w-5 text-primary" />
            )}
            <h1 className="text-lg font-semibold text-ink">
              {current?.label ?? "MedSchedule"}
            </h1>
          </div>

          <form
            onSubmit={submitSearch}
            className="relative ml-auto hidden md:block"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar paciente..."
              className="h-10 w-56 rounded-lg border border-line bg-slate-50 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-shadow focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 lg:w-72"
            />
          </form>

          <button
            className="relative ml-auto rounded-lg p-2 text-ink-soft transition-colors hover:bg-slate-100 md:ml-0"
            title="Notificações"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <Button onClick={() => openNew()} className="hidden sm:inline-flex">
            <Plus className="h-4 w-4" />
            Novo agendamento
          </Button>

          <div title={userName}>
            <Avatar name={userName} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
