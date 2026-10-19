
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [supabase] = useState(() => createClient());

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i.test(cleanEmail)) {
      setMessage("Masukkan alamat Gmail yang valid.");
      return;
    }

    setLoading(true);

    const redirectTo =
      `${window.location.origin}/auth/callback?next=/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      { redirectTo }
    );

    setLoading(false);

    if (error) {
      setMessage(
        "Permintaan belum berhasil dikirim. Periksa koneksi lalu coba lagi."
      );
      return;
    }

    setSuccess(true);
    setMessage(
      "Jika akun tersebut terdaftar, instruksi pemulihan password akan dikirim ke email tersebut. Periksa juga folder Spam."
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Lupa Password
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Masukkan Gmail akun Admin untuk meminta tautan pemulihan password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Alamat Gmail
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@gmail.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {message && (
            <p
              role="status"
              className={`rounded-lg p-3 text-sm ${
                success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Mengirim..." : "Kirim Tautan Pemulihan"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Ingat password?{" "}
          <Link
            href="/login"
            className="font-medium text-orange-600 hover:text-orange-700"
          >
            Kembali ke Login
          </Link>
        </p>
      </section>
    </main>
  );
}