"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

type FeedbackType = "success" | "error" | "warning" | "info";

type ProfileEditModalProps = {
  open: boolean;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  saving: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    email: string,
    phone: string,
    file: File | null
  ) => void;
  onFeedback: (
    title: string,
    message: string,
    type?: FeedbackType
  ) => void;
};

export default function ProfileEditModal({
  open,
  name,
  email,
  phone,
  avatarUrl,
  saving,
  onClose,
  onSave,
  onFeedback,
}: ProfileEditModalProps) {
  const [newName, setNewName] = useState(name);
  const [newEmail, setNewEmail] = useState(email);
  const [newPhone, setNewPhone] = useState(phone);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(avatarUrl);

  useEffect(() => {
    setNewName(name);
    setNewEmail(email);
    setNewPhone(phone);
    setSelectedFile(null);
    setPreviewUrl(avatarUrl);
  }, [name, email, phone, avatarUrl, open]);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onFeedback(
        "Format File Tidak Sesuai",
        "File yang dipilih harus berupa gambar.",
        "warning"
      );

      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      onFeedback(
        "Ukuran Foto Terlalu Besar",
        "Ukuran foto profil maksimal 2 MB. Silakan pilih foto lain.",
        "warning"
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Profil"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() =>
              onSave(
                newName,
                newEmail,
                newPhone,
                selectedFile
              )
            }
            disabled={saving}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      }
    >
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-3 h-24 w-24 overflow-hidden rounded-full bg-zinc-100">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview foto profil"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-zinc-400">
              {newName.charAt(0).toUpperCase() || "A"}
            </div>
          )}
        </div>

        <label className="cursor-pointer text-sm font-medium text-orange-500 hover:text-orange-600">
          Pilih Foto

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={saving}
          />
        </label>

        <p className="mt-1 text-xs text-zinc-400">
          JPG, PNG, atau gambar lain. Maksimal 2 MB.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Nama
          </label>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={saving}
            className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500 disabled:bg-zinc-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Email
          </label>

          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={saving}
            className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500 disabled:bg-zinc-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Nomor Telepon
          </label>

          <input
            type="text"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            disabled={saving}
            className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500 disabled:bg-zinc-50"
          />
        </div>
      </div>
    </Modal>
  );
}