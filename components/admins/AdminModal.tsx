"use client";

import type { FormEvent } from "react";
import AdminForm from "@/components/admins/AdminForm";
import Modal from "@/components/ui/Modal";

type Branch = {
  id: string;
  name: string;
};

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
  branch_id: string | null;
  is_active: boolean;
};

type Props = {
  editingAdmin: Admin | null;
  branches: Branch[];
  name: string;
  email: string;
  branchId: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  isSubmitting?: boolean;
};

export default function AdminModal({
  editingAdmin,
  branches,
  name,
  email,
  branchId,
  onNameChange,
  onEmailChange,
  onBranchChange,
  onSubmit,
  onClose,
  isSubmitting = false,
}: Props) {
  return (
    <Modal
      title={editingAdmin ? "Edit Admin" : "Tambah Admin"}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>

<button
            type="submit"
            form="admin-form"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Memproses..."
              : editingAdmin
                ? "Simpan Perubahan"
                : "Kirim Undangan"}
          </button>
        </div>
      }
    >
      <AdminForm
        editingAdmin={editingAdmin}
        branches={branches}
        name={name}
        email={email}
        branchId={branchId}
        onNameChange={onNameChange}
        onEmailChange={onEmailChange}
        onBranchChange={onBranchChange}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}