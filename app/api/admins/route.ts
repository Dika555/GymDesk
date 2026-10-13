import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // 1. Pastikan pengguna sudah login
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authUserError,
    } = await supabase.auth.getUser();

    if (authUserError || !user) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    // 2. Pastikan pengguna adalah Super Admin
    const { data: profile, error: profileError } = await supabase
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

    // 3. Baca dan validasi data
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

    const { name, email, password, branch_id } = body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
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
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      password.length < 8 ||
      password.length > 128 ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        branch_id
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Nama, email, password, atau pilihan cabang tidak memenuhi ketentuan.",
        },
        { status: 400 }
      );
    }

    // 4. Ambil konfigurasi server
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Konfigurasi server belum lengkap." },
        { status: 500 }
      );
    }

    // 5. Buat client admin khusus di server
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 6. Pastikan cabang tersedia
    const { data: branch, error: branchError } = await supabaseAdmin
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

    // 7. Buat akun autentikasi
    const { data: authData, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
      });

    if (createUserError || !authData.user) {
      return NextResponse.json(
        { error: "Akun Admin gagal dibuat. Periksa data yang dimasukkan." },
        { status: 400 }
      );
    }

    // 8. Buat profil Admin
    const { error: insertProfileError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        name: cleanName,
        email: cleanEmail,
        role: "admin",
        branch_id,
      });

    if (insertProfileError) {
      // Batalkan akun Auth jika pembuatan profil gagal
      const { error: deleteUserError } =
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      if (deleteUserError) {
        // Jangan cetak objek error atau data akun ke console.
        // Akun tanpa profil perlu diperiksa melalui log server yang aman.
        return NextResponse.json(
          {
            error:
              "Profil Admin gagal dibuat dan perlu pemeriksaan oleh pengelola sistem.",
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
      message: "Admin berhasil dibuat.",
    });
  } catch {
    // Jangan kirim detail error internal kepada pengguna.
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}