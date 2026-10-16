"use client";

import AddVisitForm from "@/components/visits/AddVisitForm";
import Modal from "@/components/ui/Modal";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddVisitModal({
  onClose,
  onSuccess,
}: Props) {
  return (
    <Modal
      title="Catat Kunjungan"
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
            form="add-visit-form"
            className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
          >
            Simpan Kunjungan
          </button>
        </div>
      }
      
    >
      <AddVisitForm onSuccess={onSuccess} />
    </Modal>
  );
}