import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const userName =
    (meta.name as string) ||
    (meta.full_name as string) ||
    user.email?.split("@")[0] ||
    "Usuário";
  const userEmail = user.email ?? "";
  const userAvatar =
    (meta.avatar_url as string) || (meta.picture as string) || null;

  return (
    <AppShell userName={userName} userEmail={userEmail} userAvatar={userAvatar}>
      {children}
    </AppShell>
  );
}
