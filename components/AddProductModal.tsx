"use client";

import AddProductForm from "@/components/AddProductForm";
import Modal from "@/components/Modal";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddProductModal({
  onClose,
  onSuccess,
}: Props) {
  return (
    <Modal
      title="Tambah Produk"
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
            form="add-product-form"
            className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
          >
            Simpan Produk
          </button>
        </div>
      }
    >
      <AddProductForm onSuccess={onSuccess} />
    </Modal>
  );
}