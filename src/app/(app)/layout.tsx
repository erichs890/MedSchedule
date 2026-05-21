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

  const userName =
    (user.user_metadata?.name as string | undefined) ?? "Dra. Helena Martins";
  const userEmail = user.email ?? "";

  return (
    <AppShell userName={userName} userEmail={userEmail}>
      {children}
    </AppShell>
  );
}
