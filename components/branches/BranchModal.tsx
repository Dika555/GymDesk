"use client";

import BranchForm from "@/components/branches/BranchForm";
import Modal from "@/components/ui/Modal";

type Props = {
  editingId: string | null;

  name: string;
  address: string;
  phone: string;

  onNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onPhoneChange: (value: string) => void;

  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function BranchModal({
  editingId,
  name,
  address,
  phone,
  onNameChange,
  onAddressChange,
  onPhoneChange,
  onSubmit,
  onClose,
}: Props) {
  return (
    <Modal
      title={editingId ? "Edit Cabang" : "Tambah Cabang"}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Batal
          </button>

          <button
            type="submit"
            form="branch-form"
            className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
          >
            {editingId ? "Simpan Perubahan" : "Simpan Cabang"}
          </button>
        </div>
      }
    >
      <BranchForm
        name={name}
        address={address}
        phone={phone}
        onNameChange={onNameChange}
        onAddressChange={onAddressChange}
        onPhoneChange={onPhoneChange}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}