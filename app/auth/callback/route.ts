
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next");

    const allowedDestinations = [
        "/set-password",
        "/reset-password",
    ];

    const destination =
        next === "/reset-password"
            ? "/reset-password?recovery=1"
            : next === "/set-password"
                ? "/set-password?invite=1"
                : "/login";


    if (!code) {
        return NextResponse.redirect(
            new URL("/login?error=invalid_link", url.origin)
        );
    }

    const supabase = await createClient();

    const { error } =
        await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(
            new URL("/login?error=verification_failed", url.origin)
        );
    }

    return NextResponse.redirect(
        new URL(destination, url.origin)
    );
}
