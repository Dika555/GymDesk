"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import ProfileEditModal from "@/components/profile/ProfileEditModal";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { logActivity } from "@/lib/activity-log";
import {
  UserRound,
  Building2,
  Pencil,
  ShieldCheck,
  Phone,
  MapPin,
} from "lucide-react";

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url: string | null;
  branch_id: string | null;
};

type FeedbackType = "success" | "error" | "warning" | "info";

type FeedbackState = {
  open: boolean;
  title: string;
  message: string;
  type: FeedbackType;
};

const initialFeedback: FeedbackState = {
  open: false,
  title: "",
  message: "",
  type: "info",
};

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assignedBranchName, setAssignedBranchName] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [feedback, setFeedback] =
    useState<FeedbackState>(initialFeedback);

  function showFeedback(
    title: string,
    message: string,
    type: FeedbackType = "info"
  ) {
    setFeedback({
      open: true,
      title,
      message,
      type,
    });
  }

  const loadProfile = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        showFeedback(
          "Sesi Tidak Ditemukan",
          "Silakan masuk kembali untuk melihat profil.",
          "warning"
        );
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, phone, role, avatar_url, branch_id")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setName(data.name ?? "");
      setPhone(data.phone ?? "");
      setAvatarUrl(data.avatar_url ?? "");
    } catch (error) {
      console.error("Gagal memuat profil:", error);

      showFeedback(
        "Gagal Memuat Profil",
        "Informasi profil tidak dapat dimuat. Silakan muat ulang halaman.",
        "error"
      );
    }
  }, [supabase]);


  async function handleSaveProfile(
    newName: string,
    newPhone: string,
    file: File | null
  ) {
    if (!profile) {
      showFeedback(
        "Profil Tidak Ditemukan",
        "Data profil belum tersedia. Silakan muat ulang halaman.",
        "warning"
      );
      return;
    }

    const trimmedName = newName.trim();
    const trimmedPhone = newPhone.trim();

    const changes: string[] = [];

    if (profile.name !== trimmedName) {
      changes.push(
        `Nama: "${profile.name}" → "${trimmedName}"`
      );
    }

    if ((profile.phone ?? "") !== trimmedPhone) {
      changes.push(
        `Nomor telepon: "${profile.phone || "-"}" → "${trimmedPhone || "-"}"`
      );
    }

    if (file) {
      changes.push("Foto profil diperbarui");
    }

    if (!trimmedName) {
      showFeedback(
        "Data Belum Lengkap",
        "Nama wajib diisi.",
        "warning"
      );
      return;
    }

    setSavingProfile(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        showFeedback(
          "Sesi Tidak Ditemukan",
          "Silakan masuk kembali sebelum mengubah profil.",
          "warning"
        );
        return;
      }

      let newAvatarUrl = avatarUrl;

      if (file) {
        const fileExtension = file.name.split(".").pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(
            `Gagal mengunggah foto: ${uploadError.message}`
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from("profile-images")
          .getPublicUrl(filePath);

        newAvatarUrl = publicUrlData.publicUrl;
      }

      const { error: userError } = await supabase
        .from("users")
        .update({
          name: trimmedName,
          phone: trimmedPhone,
          avatar_url: newAvatarUrl,
        })
        .eq("id", user.id);

      if (userError) throw userError;

      if (changes.length > 0) {
        await logActivity({
          action: "UPDATE",
          description: `Memperbarui profil akun: ${changes.join("; ")}.`,
          branchId: profile.branch_id,
        });
      }

      const updatedProfile: UserProfile = {
        ...profile,
        name: trimmedName,
        phone: trimmedPhone,
        avatar_url: newAvatarUrl,
      };

      setProfile(updatedProfile);
      setName(trimmedName);
      setPhone(trimmedPhone);
      setAvatarUrl(newAvatarUrl);

      window.dispatchEvent(new Event("profile-updated"));
      setIsProfileModalOpen(false);

      showFeedback(
        "Profil Berhasil Diperbarui",
        "Informasi profil berhasil disimpan.",
        "success"
      );
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);

      showFeedback(
        "Gagal Memperbarui Profil",
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan profil.",
        "error"
      );
    } finally {
      setSavingProfile(false);
    }
  }

  const loadAssignedBranch = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) return;

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("branch_id, role")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;

      // Super Admin tidak harus terikat pada satu cabang.
      if (userData.role === "super_admin") {
        setAssignedBranchName("Semua Cabang");
        return;
      }

      if (!userData.branch_id) {
        setAssignedBranchName("Belum ditetapkan");
        return;
      }

      const { data: branch, error: branchError } = await supabase
        .from("branches")
        .select("name")
        .eq("id", userData.branch_id)
        .single();

      if (branchError) throw branchError;

      setAssignedBranchName(branch.name ?? "Belum ditetapkan");
    } catch (error) {
      console.error("Gagal memuat cabang akun:", error);
      setAssignedBranchName("Gagal memuat cabang");
    }
  }, [supabase]);

  useEffect(() => {
    async function loadData() {
      await Promise.all([
        loadProfile(),
        loadAssignedBranch(),
      ]);
    }

    void loadData();
  }, [loadProfile, loadAssignedBranch]);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 md:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Judul Utama */}
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <UserRound size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Profil
            </h1>
            <p className="mt-1 text-sm leading-5 text-zinc-500">
              Kelola informasi akun
            </p>
          </div>
        </div>

        {/* Profil Admin */}
        <section className="mt-7 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <UserRound size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Profil Admin
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Informasi akun yang sedang digunakan.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="hidden shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:inline-flex"
            >
              <Pencil size={16} />
              Edit Profil
            </button>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-col items-center gap-4 rounded-xl bg-zinc-50 px-4 py-6 text-center sm:flex-row sm:items-center sm:gap-5 sm:px-5 sm:text-left">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-zinc-200 shadow-sm">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Foto profil"
                    className="block h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-zinc-500">
                    {name?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="break-words text-xl font-bold text-zinc-900 sm:text-2xl">
                  {name || "- Nama"}
                </h3>

                <p className="mt-1 break-all text-sm text-zinc-600">
                  {profile?.email ?? ""}
                </p>

                <p className="mt-1 text-sm text-zinc-600">
                  {phone || "- Nomor Telepon"}
                </p>

                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                  <ShieldCheck size={14} />
                  {profile?.role || "Role belum diatur"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex sm:hidden">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <Pencil size={16} />
                Edit Profil
              </button>
            </div>

            <div className="mt-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">
                Informasi Akun
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 p-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <ShieldCheck size={17} className="text-orange-500" />
                    Role
                  </div>
                  <p className="mt-2 break-words text-base font-semibold text-zinc-900">
                    {profile?.role || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-200 p-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Building2 size={17} className="text-orange-500" />
                    Cabang
                  </div>
                  <p className="mt-2 break-words text-base font-semibold text-zinc-900">
                    {assignedBranchName || "Belum ditetapkan"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ProfileEditModal
        open={isProfileModalOpen}
        name={name}
        email={profile?.email ?? ""}
        phone={phone}
        avatarUrl={avatarUrl}
        saving={savingProfile}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        onFeedback={showFeedback}
      />

      <FeedbackModal
        open={feedback.open}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
        onClose={() =>
          setFeedback((current) => ({
            ...current,
            open: false,
          }))
        }
      />
    </main>
  );
}
