
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);

    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");
    const next = url.searchParams.get("next");

    if (!tokenHash || type !== "invite") {
        return NextResponse.redirect(
            new URL("/login?error=invalid_link", url.origin)
        );
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "invite",
    });

    if (error) {
        console.error("Invite confirmation error:", error.message);

        return NextResponse.redirect(
            new URL("/login?error=verification_failed", url.origin)
        );
    }

    const destination =
        next === "/set-password"
            ? "/set-password?invite=1"
            : "/set-password?invite=1";

    return NextResponse.redirect(
        new URL(destination, url.origin)
    );
}
