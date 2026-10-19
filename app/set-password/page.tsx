
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createClient());

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      const isInvitation = searchParams.get("invite") === "1";

      if (error || !data.session || !isInvitation) {
        setMessage(
          "Tautan undangan tidak valid atau sudah kedaluwarsa. Minta Super Admin mengirim undangan baru."
        );
        setValidSession(false);
      } else {
        setValidSession(true);
      }

      setLoading(false);
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [supabase, searchParams]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Konfirmasi password tidak sama.");
      return;
    }

    if (!validSession) {
      setMessage("Tautan undangan tidak valid. Minta undangan baru.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({ password });

    setSaving(false);

    if (error) {
      setMessage(
        "Password gagal disimpan. Silakan minta Super Admin mengirim undangan baru jika tautan sudah kedaluwarsa."
      );
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login?passwordSet=success");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <p className="text-sm text-zinc-600">
          Memeriksa tautan undangan...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">
          Buat Password GymDesk
        </h1>

        <p className="mt-2 text-sm text-zinc-600">
          Buat password untuk menyelesaikan aktivasi akun Admin.
        </p>

        {message && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {message}
          </div>
        )}

        {validSession ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Password baru
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Konfirmasi password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                minLength={8}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
                placeholder="Ulangi password baru"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-orange-500 px-4 py-3 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Aktifkan Akun"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-5 w-full rounded-lg bg-orange-500 px-4 py-3 font-medium text-white hover:bg-orange-600"
          >
            Kembali ke Login
          </button>
        )}
      </section>
    </main>
  );
}
