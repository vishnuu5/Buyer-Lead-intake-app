import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
          const forwardedHost = request.headers.get("x-forwarded-host");
          const isLocalEnv = process.env.NODE_ENV === "development";

          if (isLocalEnv) {
            return NextResponse.redirect(`${origin}${next}`);
          } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${next}`);
          } else {
            return NextResponse.redirect(`${origin}${next}`);
          }
        } else {
          console.error("Auth exchange error:", error);
          return NextResponse.redirect(
            `${origin}/auth/auth-code-error?error=${encodeURIComponent(
              error.message
            )}`
          );
        }
      } catch (err) {
        console.error("Unexpected auth error:", err);
        return NextResponse.redirect(
          `${origin}/auth/auth-code-error?error=unexpected_error`
        );
      }
    } else {
      console.error("Supabase client not available");
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=client_unavailable`
      );
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`);
}
