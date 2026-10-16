"use client";

import AddStockForm from "./AddStockForm";
import Modal from "@/components/ui/Modal";

type AddStockModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function AddStockModal({
  open,
  onClose,
  onSuccess,
  onError,
}: AddStockModalProps) {
  return (
    <Modal
      open={open}
      title="Tambah Stok"
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
            form="add-stock-form"
            className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
          >
            Simpan Stok
          </button>
        </div>
      }
      maxWidth="max-w-md"
    >
      <AddStockForm
        onSuccess={onSuccess}
        onError={onError}
      />
    </Modal>
  );
}