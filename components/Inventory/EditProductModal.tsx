"use client";

import EditProductForm from "./EditProductForm";
import Modal from "@/components/ui/Modal";

type EditProductModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
  productId: string;
};

export default function EditProductModal({
  open,
  onClose,
  onSuccess,
  onError,
  productId,
}: EditProductModalProps) {
  return (
    <Modal
      open={open}
      title="Edit Produk"
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
            form="edit-product-form"
            className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
          >
            Simpan Perubahan
          </button>
        </div>
      }
      maxWidth="max-w-md"
    >
      <EditProductForm
        productId={productId}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Modal>
  );
}