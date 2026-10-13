"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  X
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/" },
  { name: "Members", href: "/members" },
  { name: "Membership", href: "/membership" },
  { name: "Visits", href: "/visits" },
  { name: "Trainers", href: "/trainers" },
  { name: "Transactions", href: "/transactions" },
  { name: "Inventory", href: "/inventory" },
  { name: "Reports", href: "/reports" },
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
    const supabase = createClient();

    await supabase.auth.signOut();

    setRole(null);
    router.push("/login");
  }

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-black text-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >

        {/* Header Sidebar */}
<div className="relative flex h-20 shrink-0 items-center justify-center border-b border-zinc-800 px-12">
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
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-1">

            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${isActive
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
              <div className="mt-6 border-t border-zinc-800 pt-4">
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
            onClick={handleLogout}
            className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}
    </>
  );
}