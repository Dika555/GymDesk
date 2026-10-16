"use client";

import { useState } from "react";
import { PackagePlus } from "lucide-react";
import AddProductModal from "@/components/AddProductModal";
import FeedbackModal from "@/components/FeedbackModal";

type Props = {
  onSuccess: () => void;
};

export default function AddProductButton({ onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [feedback, setFeedback] = useState({
    open: false,
    title: "",
    message: "",
    type: "success" as "success" | "error" | "warning" | "info",
  });

  function handleSuccess() {
    setIsOpen(false);
    onSuccess();

    setFeedback({
      open: true,
      title: "Produk Berhasil Ditambahkan",
      message: "Produk berhasil disimpan ke inventaris.",
      type: "success",
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        <PackagePlus size={18} />+
        Tambah Produk
      </button>

      {isOpen && (
        <AddProductModal
          onClose={() => setIsOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

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