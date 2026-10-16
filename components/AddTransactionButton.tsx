"use client";

import { useState } from "react";
import AddTransactionModal from "@/components/AddTransactionModal";
import {
  ReceiptText
} from "lucide-react";
type Props = {
  onSuccess: () => void;
};

export default function AddTransactionButton({ onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"

      >
        <ReceiptText size={18} />+
        Catat Transaksi
      </button>

      {isOpen && (
        <AddTransactionModal
          onClose={() => setIsOpen(false)}
          onSuccess={() => {
            setIsOpen(false);
            onSuccess();
          }}
        />
      )}
    </>
  );
}