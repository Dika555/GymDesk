"use client";

import { useState } from "react";
import { PackagePlus } from "lucide-react";
import AddStockModal from "./AddStockModal";
import FeedbackModal from "@/components/ui/FeedbackModal";

type FeedbackType = "success" | "error" | "warning" | "info";

type AddStockButtonProps = {
  onSuccess: () => void;
};

export default function AddStockButton({
  onSuccess,
}: AddStockButtonProps) {
  const [open, setOpen] = useState(false);

  const [feedback, setFeedback] = useState({
    open: false,
    title: "",
    message: "",
    type: "info" as FeedbackType,
  });

  function showFeedback(
    title: string,
    message: string,
    type: FeedbackType
  ) {
    setFeedback({
      open: true,
      title,
      message,
      type,
    });
  }

  function handleSuccess() {
    setOpen(false);

    onSuccess();

    showFeedback(
      "Stok Berhasil Ditambahkan",
      "Jumlah stok produk berhasil diperbarui.",
      "success"
    );
  }

  function handleError(message: string) {
    showFeedback(
      "Gagal Menambahkan Stok",
      message,
      "error"
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        <PackagePlus size={18} />+
        Tambah Stok
      </button>

      <AddStockModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <FeedbackModal
        open={feedback.open}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
        onClose={() =>
          setFeedback((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </>
  );
}