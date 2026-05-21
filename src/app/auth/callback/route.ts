import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Recebe o retorno do login social (Google) e troca o código por uma sessão.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const authError = searchParams.get("error_description");

  if (authError) {
    return NextResponse.redirect(
      `${origin}/login?erro=${encodeURIComponent(authError)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?erro=${encodeURIComponent(
          "Falha ao concluir o login com o Google.",
        )}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
