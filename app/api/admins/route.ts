
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let supabaseAdmin:
  | ReturnType<typeof createClient<any>>
  | null = null;
  let createdUserId: string | null = null;

  try {
    // 1. Pastikan pengguna sudah login
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    // 2. Pastikan pengguna adalah Super Admin
    const { data: profile, error: profileError } =
      await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || profile?.role !== "super_admin") {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk melakukan tindakan ini." },
        { status: 403 }
      );
    }

    // 3. Validasi data
    let body: {
      name?: unknown;
      email?: unknown;
      password?: unknown;
      branch_id?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Format data tidak valid." },
        { status: 400 }
      );
    }

    const { name, email, branch_id } = body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof branch_id !== "string"
    ) {
      return NextResponse.json(
        { error: "Data Admin tidak valid." },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanName.length < 2 ||
      cleanName.length > 100 ||
      cleanEmail.length > 254 ||
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i.test(
        cleanEmail
      ) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        branch_id
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Nama, alamat Gmail, atau pilihan cabang tidak valid.",
        },
        { status: 400 }
      );
    }

    // 4. Konfigurasi server
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Konfigurasi server belum lengkap." },
        { status: 500 }
      );
    }

    supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 5. Pastikan cabang tersedia
    const { data: branch, error: branchError } =
      await supabaseAdmin
        .from("branches")
        .select("id")
        .eq("id", branch_id)
        .maybeSingle();

    if (branchError) {
      return NextResponse.json(
        { error: "Cabang gagal diperiksa." },
        { status: 500 }
      );
    }

    if (!branch) {
      return NextResponse.json(
        { error: "Cabang tidak ditemukan." },
        { status: 400 }
      );
    }

    // 6. Tentukan tujuan setelah undangan dibuka
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://gymdesk-dika25.vercel.app/";

    // 7. Kirim undangan dan buat akun yang belum dikonfirmasi
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(
        cleanEmail,
        {
          data: { name: cleanName },
          redirectTo: `${siteUrl}/auth/callback?next=/set-password`,
        }
      );

    if (inviteError || !inviteData.user) {
      return NextResponse.json(
        {
          error:
            "Undangan gagal dikirim. Periksa email atau pastikan alamat tersebut belum terdaftar.",
        },
        { status: 400 }
      );
    }

    createdUserId = inviteData.user.id;

    // 8. Buat profil Admin
    const { error: insertProfileError } =
      await supabaseAdmin.from("users").insert({
        id: createdUserId,
        name: cleanName,
        email: cleanEmail,
        role: "admin",
        branch_id,
      });

    if (insertProfileError) {
      // Hapus akun Auth jika profil gagal dibuat
      const { error: deleteError } =
        await supabaseAdmin.auth.admin.deleteUser(
          createdUserId
        );

      if (deleteError) {
        return NextResponse.json(
          {
            error:
              "Profil gagal dibuat dan akun perlu diperiksa oleh pengelola sistem.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Profil Admin gagal dibuat." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Undangan Admin berhasil dikirim. Admin harus membuka email untuk mengaktifkan akun dan membuat password.",
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
