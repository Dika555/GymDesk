"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import BranchSwitcher from "@/components/layout/BranchSwitcher";
import {
  Menu,
  UserRound
} from "lucide-react";
type UserProfile = {
  name: string;
  avatar_url: string | null;
};

export default function Header() {
  const supabase = createClient();

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();

    window.addEventListener(
      "profile-updated",
      loadProfile
    );

    return () => {
      window.removeEventListener(
        "profile-updated",
        loadProfile
      );
    };
  }, []);
  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("name, avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Gagal memuat profil pengguna.");
      return;
    }

    setProfile(data);
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-zinc-200 bg-white lg:left-64">
      <div className="flex h-full items-center justify-between gap-2 px-3 sm:px-6">
        {/* Menu dan Pilihan Cabang */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("sidebar-toggle")
              )
            }
            className="shrink-0 rounded-lg p-2 text-zinc-700 transition hover:bg-zinc-100 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0 flex-1 sm:flex-none sm:w-64">
            <BranchSwitcher />
          </div>
        </div>

        {/* Profil Admin */}
        <Link
          href="/profile"
          aria-label="Buka profil"
          className="flex shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-1.5 py-1 transition hover:bg-zinc-200 sm:gap-3 sm:px-2"
        >
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Foto profil"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-500">
                <UserRound size={20} />
              </div>
            )}
          </div>

          <span className="hidden max-w-28 truncate text-sm font-medium text-zinc-700 sm:block">
            {profile?.name || "Admin"}
          </span>
        </Link>
      </div>
    </header>
  );
}