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
  BarChart3,
  Settings,
  Plus,
  Search,
  LogOut,
  CalendarHeart,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeSync } from "@/lib/realtime";
import { useMounted } from "@/lib/use-mounted";
import { useUI } from "./UIProvider";
import { ChatWidget } from "./ChatWidget";
import { CommandPalette } from "./CommandPalette";
import { NotificationsBell } from "./NotificationsBell";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, Button, Spinner, cn } from "./ui";

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
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** Conteúdo da sidebar. `expanded` = sempre mostrar textos (modo gaveta). */
function SidebarContent({
  expanded,
  pathname,
  onNew,
  onLogout,
  userName,
  userEmail,
  userAvatar,
  onNavigate,
}: {
  expanded: boolean;
  pathname: string;
  onNew: () => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  onNavigate: () => void;
}) {
  const label = expanded ? "inline" : "hidden lg:inline";
  const block = expanded ? "block" : "hidden lg:block";

  return (
    <>
      {/* Logo: leva ao calendário */}
      <Link
        href="/"
        onClick={onNavigate}
        className="flex h-[68px] items-center gap-2.5 px-4 transition-colors hover:bg-muted lg:px-5"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <CalendarHeart className="h-5 w-5" />
        </div>
        <div className={block}>
          <p className="text-sm font-bold leading-tight text-ink">
            MedSchedule
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            Medical SaaS
          </p>
        </div>
      </Link>

      {/* New appointment */}
      <div className="px-3 pb-2 pt-1 lg:px-4">
        <button
          onClick={() => {
            onNew();
            onNavigate();
          }}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          <span className={label}>Novo Agendamento</span>
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
              onClick={onNavigate}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                active
                  ? "bg-primary text-white"
                  : "text-ink-soft hover:bg-muted hover:text-ink",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className={label}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Rodapé: conta do usuário, leva às configurações */}
      <div className="border-t border-line p-3 lg:p-4">
        <div
          className={cn(
            "items-center gap-1",
            expanded ? "flex" : "hidden lg:flex",
          )}
        >
          <Link
            href="/configuracoes"
            onClick={onNavigate}
            title="Configurações do perfil"
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted"
          >
            <Avatar name={userName} src={userAvatar} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {userName}
              </p>
              <p className="truncate text-xs text-ink-muted">{userEmail}</p>
            </div>
          </Link>
          <button
            onClick={onLogout}
            title="Sair"
            className="shrink-0 rounded-lg p-2 text-ink-muted transition-colors hover:bg-muted hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        {!expanded && (
          <Link
            href="/configuracoes"
            onClick={onNavigate}
            title="Configurações do perfil"
            className="flex w-full items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-muted lg:hidden"
          >
            <Avatar name={userName} src={userAvatar} size="sm" />
          </Link>
        )}
      </div>
    </>
  );
}

export function AppShell({
  children,
  userName,
  userEmail,
  userAvatar,
}: {
  children: ReactNode;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { openNew } = useUI();
  const [mobileNav, setMobileNav] = useState(false);
  const live = useRealtimeSync();
  const mounted = useMounted();

  const current = NAV.find((n) => isActive(pathname, n.href));

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar fixa: tablet e desktop */}
      <aside className="hidden w-[76px] shrink-0 flex-col border-r border-line bg-surface md:flex lg:w-64">
        <SidebarContent
          expanded={false}
          pathname={pathname}
          onNew={openNew}
          onLogout={logout}
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          onNavigate={() => {}}
        />
      </aside>

      {/* Gaveta: celular */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 animate-fade-in"
            onClick={() => setMobileNav(false)}
          />
          <aside className="animate-slide-in-left relative flex h-full w-64 flex-col border-r border-line bg-surface">
            <button
              onClick={() => setMobileNav(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-ink-muted hover:bg-muted hover:text-ink"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              expanded
              pathname={pathname}
              onNew={openNew}
              onLogout={logout}
              userName={userName}
              userEmail={userEmail}
              userAvatar={userAvatar}
              onNavigate={() => setMobileNav(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-[68px] shrink-0 items-center gap-3 border-b border-line bg-surface px-4 lg:px-8">
          <button
            onClick={() => setMobileNav(true)}
            className="-ml-1 rounded-lg p-2 text-ink-soft transition-colors hover:bg-muted md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {current && (
              <current.icon className="hidden h-5 w-5 shrink-0 text-primary sm:block" />
            )}
            <h1 className="truncate text-base font-semibold text-ink lg:text-lg">
              {current?.label ?? "MedSchedule"}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new Event("medschedule:command"))
              }
              className="hidden h-10 w-56 items-center gap-2 rounded-lg border border-line bg-muted px-3 text-sm text-ink-muted transition-colors hover:border-primary/30 hover:bg-surface lg:flex xl:w-72"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Buscar...</span>
              <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold">
                Ctrl K
              </kbd>
            </button>

            <div
              className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 md:flex"
              title={
                live
                  ? "Sincronização em tempo real ativa"
                  : "Conectando à sincronização em tempo real"
              }
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  live ? "animate-pulse-dot bg-emerald-500" : "bg-ink-muted",
                )}
              />
              <span className="text-xs font-medium text-ink-soft">
                {live ? "Ao vivo" : "Conectando"}
              </span>
            </div>

            <ThemeToggle />

            <NotificationsBell />

            <div className="hidden lg:block">
              <Button onClick={() => openNew()}>
                <Plus className="h-4 w-4" />
                Novo agendamento
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {mounted ? (
            children
          ) : (
            <div className="flex h-full items-center justify-center py-20">
              <Spinner className="h-7 w-7 text-primary" />
            </div>
          )}
        </main>
      </div>

      {/* Assistente virtual + busca global */}
      <ChatWidget />
      <CommandPalette />
    </div>
  );
}
