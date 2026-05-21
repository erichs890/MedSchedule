"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser, useUploadAvatar } from "@/lib/hooks";
import { useUI } from "./UIProvider";
import { Avatar, Button, Spinner } from "./ui";

export function AccountCard() {
  const router = useRouter();
  const { toast } = useUI();
  const { data: user, isLoading } = useCurrentUser();
  const uploadAvatar = useUploadAvatar();
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = (user?.user_metadata ?? {}) as Record<string, string | undefined>;
  const name =
    meta.name || meta.full_name || user?.email?.split("@")[0] || "Usuário";
  const email = user?.email ?? "";
  const avatar = meta.avatar_url || meta.picture || null;
  const isGoogle = user?.app_metadata?.provider === "google";

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Selecione um arquivo de imagem.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("Imagem muito grande (máximo 5 MB).", "error");
      return;
    }
    try {
      await uploadAvatar.mutateAsync(file);
      toast("Foto de perfil atualizada.");
      router.refresh();
    } catch {
      toast(
        "Não foi possível enviar a foto. Verifique se o Storage foi configurado (db/storage.sql).",
        "error",
      );
    }
  }

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Spinner className="h-4 w-4" /> Carregando...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar name={name} src={avatar} size="lg" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadAvatar.isPending}
            title="Alterar foto"
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white ring-2 ring-surface transition-colors hover:bg-primary-dark"
          >
            {uploadAvatar.isPending ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPick}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{name}</p>
          <p className="truncate text-sm text-ink-soft">{email}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {isGoogle ? "Conta Google" : "Conta com e-mail e senha"}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-muted">
        Clique no ícone da câmera para enviar uma foto de perfil. Contas Google
        já usam a foto da conta automaticamente.
      </p>

      <div className="mt-4 border-t border-line pt-3">
        <Button variant="danger" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sair do sistema
        </Button>
      </div>
    </div>
  );
}
