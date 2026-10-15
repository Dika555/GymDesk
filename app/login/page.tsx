"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoadingScreen from "@/components/LoadingScreen";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  if (loading) {
    return (
      <LoadingScreen
        title="Memproses Login"
        description="Sedang memverifikasi akun kamu..."
      />
    );
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage("Email atau password salah.");
      setLoading(false);
      return;
    }

    if (!data.user) {
      setErrorMessage("Login gagal.");
      setLoading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("name, email, role, branch_id, is_active")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      await supabase.auth.signOut();

      setErrorMessage("Data pengguna tidak ditemukan.");
      setLoading(false);
      return;
    }

    if (userData.is_active === false) {
      await supabase.auth.signOut();

      setErrorMessage("Akun kamu sedang tidak aktif.");
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="grid min-h-screen md:grid-cols-2">

        {/* =========================
                    PANEL KIRI
                ========================== */}
        <section className="relative hidden min-h-screen overflow-hidden bg-zinc-950 md:flex">

          {/* Background Image */}
          <img
            src="/login-gym.jpeg"
            alt="Gym"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/65" />

          {/* Branding Content */}
          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-12 lg:p-16">
            <div className="h-2" />

            {/* Main Branding */}
            <div className="max-w-xl">

              <p className="mb-4 text-xl font-extrabold tracking-[0.3em] text-orange-500">
                GYM MANAGEMENT SYSTEM
              </p>

              <h1 className="text-4xl font-bold leading-tight text-white lg:text-6xl">
                Kelola gym
                <br />

                <span className="text-orange-500">
                  lebih mudah,
                </span>

                <br />

                semua dalam
                <br />

                satu sistem.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-zinc-300">
                Kelola member, membership, kunjungan, trainer,
                transaksi, inventory, dan laporan gym dalam
                satu sistem.
              </p>

              <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
                <div className="flex items-center gap-4 rounded-xl border border-white/20 bg-zinc-950/70 p-4 backdrop-blur-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <circle cx="12" cy="8" r="3" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.5 20c.8-3.5 3.2-5.5 6.5-5.5s5.7 2 6.5 5.5"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Member
                    </p>
                    <p className="text-xs text-zinc-400">
                      & Membership
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-white/20 bg-zinc-950/70 p-4 backdrop-blur-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <rect
                        x="4"
                        y="5"
                        width="16"
                        height="15"
                        rx="2"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 3v4M16 3v4M4 10h16"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Kunjungan
                    </p>
                    <p className="text-xs text-zinc-400">
                      & Trainer
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-white/20 bg-zinc-950/70 p-4 backdrop-blur-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h10"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Transaksi
                    </p>
                    <p className="text-xs text-zinc-400">
                      & Inventory
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-white/20 bg-zinc-950/70 p-4 backdrop-blur-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 19V5M4 19h16"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8 16 3-4 3 2 5-7"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Laporan
                    </p>
                    <p className="text-xs text-zinc-400">
                      Gym
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <p className="text-sm text-zinc-400">
              © 2026 GymDesk. Gym Management System.
            </p>

          </div>
        </section>


        {/* =========================
                    PANEL KANAN
                ========================== */}
        <section className="flex min-h-screen items-center justify-center overflow-hidden rounded-l-none bg-white px-6 py-10 md:rounded-l-3xl sm:px-10 lg:px-16">

          <div className="w-full max-w-md">

            {/* Login Header */}
            <div className="mb-10 text-center">

              {/* User Icon */}
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-8 w-8 text-orange-500"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="3.5"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.5 20c.8-3.5 3.2-5.5 6.5-5.5s5.7 2 6.5 5.5"
                  />
                </svg>

              </div>

              <h2 className="text-3xl font-bold text-zinc-900">
                Login
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Masuk ke dashboard GymDesk
              </p>

            </div>


            {/* Login Form */}
            <form
              onSubmit={handleLogin}
              className="space-y-6"
            >

              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-zinc-800"
                >
                  Email
                </label>

                <div className="relative">

                  {/* Email Icon */}
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4 7 8 6 8-6"
                      />
                    </svg>

                  </div>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Masukkan email"
                    required
                    className="h-14 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />

                </div>

              </div>


              {/* Password */}
              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-zinc-800"
                >
                  Password
                </label>

                <div className="relative">

                  {/* Lock Icon */}
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10V7a4 4 0 0 1 8 0v3"
                      />

                    </svg>

                  </div>


                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Masukkan password"
                    required
                    className="h-14 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />


                  {/* Show Password Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700"
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >

                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 5 8.5 7s-3.5 7-8.5 7a9.5 9.5 0 0 1-4.4-1.1"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.1 5.1C3.2 6.5 1.5 9.1 1.5 12c0 1.3 1.5 3.8 4.1 5.6"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                        />
                      </svg>
                    )}

                  </button>

                </div>

              </div>


              {/* Error Message */}
              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}


              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-xl bg-orange-500 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Memproses..." : "Login"}
              </button>

            </form>

          </div>

        </section>

      </div>
    </main>
  );
}