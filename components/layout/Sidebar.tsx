"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/" },
  { name: "Members", href: "/members" },
  { name: "Paket Membership", href: "/membership" },
  { name: "Kunjungan", href: "/visits" },
  { name: "Personal Trainer", href: "/trainers" },
  { name: "Transaksi", href: "/transactions" },
  { name: "Stok Produk", href: "/inventory" },
  { name: "Laporan", href: "/reports" },
];

const superAdminMenuItems = [
  { name: "Kelola Admin", href: "/admins" },
  { name: "Kelola Cabang", href: "/branches" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    function handleSidebarToggle() {
      setIsOpen((current) => !current);
    }

    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Gagal mengambil role:", error);
        setRole(null);
        return;
      }

      setRole(data.role);
    }

    // Ambil role saat Sidebar pertama kali dibuka
    loadRole();

    window.addEventListener(
      "sidebar-toggle",
      handleSidebarToggle
    );

    // Pantau perubahan login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setRole(null);
      }

      if (event === "SIGNED_IN") {
        setTimeout(() => {
          loadRole();
        }, 0);
      }
    });

    return () => {
      window.removeEventListener(
        "sidebar-toggle",
        handleSidebarToggle
      );

      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setRole(null);
      setIsLogoutModalOpen(false);
      setIsOpen(false);

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Gagal logout:", error);

      alert("Logout gagal. Silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col bg-black text-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >

        {/* Header Sidebar */}
        <div className="relative flex h-16 shrink-0 items-center justify-center border-b border-zinc-800 px-12 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/logo-GymDesk.svg"
              alt="GymDesk"
              width={160}
              height={50}
              priority
              className="h-auto w-40"
            />
          </Link>

          {/* Tombol Tutup Mobile */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="min-h-0 flex-1 overflow-y-hidden px-3 py-3 lg:px-4 lg:py-6">
          <div className="space-y-1">

            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition lg:px-4 lg:py-3 ${isActive
                    ? "bg-orange-500 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* Menu khusus Super Admin */}
            {role === "super_admin" && (
              <div className="mt-4 border-t border-zinc-800 pt-3 lg:mt-6 lg:pt-4">
                <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Super Admin
                </p>

                {superAdminMenuItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-lg px-4 py-3 mt-1 text-sm font-medium transition ${active
                        ? "bg-orange-500 text-white"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-zinc-800 p-4">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white lg:px-4 lg:py-3"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Konfirmasi Logout */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isLoggingOut) {
              setIsLogoutModalOpen(false);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <LogOut size={23} />
            </div>

            <h2
              id="logout-title"
              className="text-lg font-bold text-zinc-900"
            >
              Konfirmasi Logout
            </h2>

            <p
              id="logout-description"
              className="mt-2 text-sm leading-6 text-zinc-600"
            >
              Apakah kamu yakin ingin keluar dari akun GymDesk?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                disabled={isLoggingOut}
                className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Memproses..." : "Ya, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}
    </>
  );
}