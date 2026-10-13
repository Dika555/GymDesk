"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import ProfileEditModal from "@/components/profile/ProfileEditModal";
import BranchEditModal from "@/components/profile/BranchEditModal";
import FeedbackModal from "@/components/FeedbackModal";
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [savingBranch, setSavingBranch] = useState(false);

  const [branchInfo, setBranchInfo] = useState<{
    name: string;
    address: string | null;
    phone: string | null;
  } | null>(null);

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

  useEffect(() => {
    async function loadData() {
      await Promise.all([
        loadProfile(),
        loadBranchInfo(),
      ]);
    }

    void loadData();
  }, [loadProfile, loadBranchInfo]);

  async function loadProfile() {
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
        .select("id, name, email, phone, role, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setName(data.name ?? "");
      setEmail(data.email ?? "");
      setPhone(data.phone ?? "");
      setAvatarUrl(data.avatar_url ?? "");
    } catch (error) {
      console.error("Gagal memuat profil:", error);

      showFeedback(
        "Gagal Memuat Profil",
        "Informasi profil tidak dapat dimuat. Silakan coba lagi.",
        "error"
      );
    }
  }

  async function handleSaveProfile(
    newName: string,
    newEmail: string,
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
    const trimmedEmail = newEmail.trim();
    const trimmedPhone = newPhone.trim();

    if (!trimmedName || !trimmedEmail) {
      showFeedback(
        "Data Belum Lengkap",
        "Nama dan email wajib diisi.",
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

      // Memperbarui email autentikasi jika berubah.
      if (trimmedEmail !== profile.email) {
        const { error } = await supabase.auth.updateUser({
          email: trimmedEmail,
        });

        if (error) throw error;
      }

      // Gunakan foto lama jika tidak memilih foto baru.
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
          email: trimmedEmail,
          phone: trimmedPhone,
          avatar_url: newAvatarUrl,
        })
        .eq("id", user.id);

      if (userError) throw userError;

      // Perbarui data pada halaman.
      const updatedProfile: UserProfile = {
        ...profile,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        avatar_url: newAvatarUrl,
      };

      setProfile(updatedProfile);
      setName(trimmedName);
      setEmail(trimmedEmail);
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

  async function loadBranchInfo() {
    try {
      const branchId = getActiveBranchId();

      if (!branchId) {
        setBranchInfo(null);
        return;
      }

      const { data, error } = await supabase
        .from("branches")
        .select("name, address, phone")
        .eq("id", branchId)
        .single();

      if (error) throw error;

      setBranchInfo(data);
      setBranchName(data.name ?? "");
      setBranchAddress(data.address ?? "");
      setBranchPhone(data.phone ?? "");
    } catch (error) {
      console.error("Gagal memuat informasi gym:", error);

      showFeedback(
        "Gagal Memuat Informasi Gym",
        "Informasi cabang tidak dapat dimuat.",
        "error"
      );
    }
  }

  async function handleSaveBranch(
    newName: string,
    newPhone: string,
    newAddress: string
  ) {
    const branchId = getActiveBranchId();

    if (!branchId) {
      showFeedback(
        "Cabang Tidak Ditemukan",
        "Cabang aktif tidak ditemukan. Pilih cabang terlebih dahulu.",
        "warning"
      );
      return;
    }

    const trimmedName = newName.trim();

    if (!trimmedName) {
      showFeedback(
        "Nama Gym Belum Diisi",
        "Nama gym wajib diisi.",
        "warning"
      );
      return;
    }

    setSavingBranch(true);

    try {
      const { error: updateError } = await supabase
        .from("branches")
        .update({
          name: trimmedName,
          address: newAddress.trim(),
          phone: newPhone.trim(),
        })
        .eq("id", branchId);

      if (updateError) throw updateError;

      const { data, error: fetchError } = await supabase
        .from("branches")
        .select("name, address, phone")
        .eq("id", branchId)
        .single();

      if (fetchError) throw fetchError;

      setBranchInfo(data);
      setBranchName(data.name ?? "");
      setBranchAddress(data.address ?? "");
      setBranchPhone(data.phone ?? "");

      setIsBranchModalOpen(false);

      showFeedback(
        "Informasi Gym Berhasil Diperbarui",
        "Informasi gym pada cabang ini berhasil disimpan.",
        "success"
      );
    } catch (error) {
      console.error("Gagal menyimpan informasi gym:", error);

      showFeedback(
        "Gagal Memperbarui Informasi Gym",
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan informasi gym.",
        "error"
      );
    } finally {
      setSavingBranch(false);
    }
  }

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
              Kelola informasi akun dan informasi GymDesk.
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
                  {email || "- Email"}
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
                    {branchInfo?.name ?? "Belum ada cabang"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Informasi Gym */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Building2 size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Informasi Gym
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Informasi gym pada cabang yang sedang dikelola.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBranchModalOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:w-auto"
            >
              <Pencil size={16} />
              Edit Informasi
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div className="rounded-xl border border-zinc-200 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                <Building2 size={17} className="text-orange-500" />
                Nama Gym
              </div>
              <p className="mt-2 break-words text-base font-semibold text-zinc-900">
                {branchInfo?.name ?? "-"}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                <Phone size={17} className="text-orange-500" />
                Nomor Telepon
              </div>
              <p className="mt-2 break-words text-base font-semibold text-zinc-900">
                {branchInfo?.phone ?? "-"}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4 sm:col-span-2">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                <MapPin size={17} className="text-orange-500" />
                Alamat
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-base font-semibold leading-6 text-zinc-900">
                {branchInfo?.address ?? "-"}
              </p>
            </div>
          </div>
        </section>
      </div>

      <ProfileEditModal
        open={isProfileModalOpen}
        name={name}
        email={email}
        phone={phone}
        avatarUrl={avatarUrl}
        saving={savingProfile}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        onFeedback={showFeedback}
      />

      <BranchEditModal
        open={isBranchModalOpen}
        name={branchName}
        phone={branchPhone}
        address={branchAddress}
        saving={savingBranch}
        onClose={() => setIsBranchModalOpen(false)}
        onSave={handleSaveBranch}
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