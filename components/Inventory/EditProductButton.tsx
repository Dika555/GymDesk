"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import EditProductModal from "./EditProductModal";

type EditProductButtonProps = {
  productId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function EditProductButton({
  productId,
  onSuccess,
  onError,
}: EditProductButtonProps) {
  const [open, setOpen] = useState(false);

  function handleSuccess() {
    setOpen(false);
    onSuccess();
  }

  function handleError(message: string) {
    onError(message);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Edit produk"
        aria-label="Edit produk"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
      >
        <Pencil size={16} />
        Edit
      </button>

      <EditProductModal
        open={open}
        onClose={() => setOpen(false)}
        productId={productId}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </>
  );
}