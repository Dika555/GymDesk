
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Branch = {
  id: string;
  name: string;
};

type UserProfile = {
  role: "admin" | "super_admin";
  branch_id: string | null;
  is_active: boolean;
};

export default function BranchSwitcher() {
  const supabase = createClient();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [role, setRole] = useState<UserProfile["role"] | null>(null);
  const [loading, setLoading] = useState(true);

  function saveActiveBranch(branchId: string) {
    localStorage.setItem("activeBranchId", branchId);

    document.cookie =
      `activeBranchId=${encodeURIComponent(branchId)}; ` +
      "path=/; max-age=31536000; samesite=lax";
  }

  useEffect(() => {
    async function loadBranches() {
      try {
        // 1. Ambil akun yang sedang login.
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("Pengguna belum login:", authError?.message);
          return;
        }

        // 2. Ambil role dan cabang resmi dari database.
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("role, branch_id, is_active")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          console.error(
            "Gagal memuat profil:",
            profileError?.message
          );
          return;
        }

        const currentUser = profile as UserProfile;

        if (
          !currentUser.is_active ||
          !["admin", "super_admin"].includes(currentUser.role)
        ) {
          console.error("Akun tidak aktif atau role tidak valid.");
          return;
        }

        setRole(currentUser.role);

        // 3. Muat daftar cabang aktif.
        const { data, error } = await supabase
          .from("branches")
          .select("id, name")
          .eq("is_active", true)
          .order("name");

        if (error) {
          console.error("Gagal memuat cabang:", error.message);
          return;
        }

        const branchList = data ?? [];
        setBranches(branchList);

        // 4. Admin selalu menggunakan cabang dari profil database.
        if (currentUser.role === "admin") {
          const branchId = currentUser.branch_id;

          if (!branchId) {
            console.error("Akun Admin belum memiliki cabang.");
            return;
          }

          const assignedBranch = branchList.find(
            (branch) => branch.id === branchId
          );

          if (!assignedBranch) {
            console.error(
              "Cabang Admin tidak ditemukan atau tidak aktif."
            );
            return;
          }

          setSelectedBranch(assignedBranch.id);
          saveActiveBranch(assignedBranch.id);
          return;
        }

        // 5. Super Admin boleh memilih cabang aktif.
        const savedBranch = localStorage.getItem("activeBranchId");

        const validSavedBranch = branchList.find(
          (branch) => branch.id === savedBranch
        );

        const activeBranch = validSavedBranch ?? branchList[0];

        if (activeBranch) {
          setSelectedBranch(activeBranch.id);
          saveActiveBranch(activeBranch.id);
        }
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBranches();
  }, []);

  function handleChange(branchId: string) {
    // Hanya Super Admin yang boleh mengganti cabang.
    if (role !== "super_admin") return;

    const validBranch = branches.find(
      (branch) => branch.id === branchId
    );

    if (!validBranch) return;

    setSelectedBranch(validBranch.id);
    saveActiveBranch(validBranch.id);

    window.location.reload();
  }

  if (loading || !role) {
    return null;
  }

  // Admin melihat nama cabangnya, tanpa dropdown pindah cabang.
  if (role === "admin") {
    const currentBranch = branches.find(
      (branch) => branch.id === selectedBranch
    );

    return (
      <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
        <span className="mr-2 text-zinc-500">Cabang:</span>
        <span className="font-medium">
          {currentBranch?.name ?? "Cabang belum tersedia"}
        </span>
      </div>
    );
  }

  // Super Admin tetap memiliki dropdown pemilih cabang.
  return (
    <select
      value={selectedBranch}
      onChange={(event) => handleChange(event.target.value)}
      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-orange-500"
      aria-label="Pilih cabang"
    >
      {branches.map((branch) => (
        <option key={branch.id} value={branch.id}>
          {branch.name}
        </option>
      ))}
    </select>
  );
}
