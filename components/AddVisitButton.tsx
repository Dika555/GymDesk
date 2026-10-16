"use client";

import { useState } from "react";
import AddVisitModal from "@/components/AddVisitModal";
import {
  CalendarCheck
} from "lucide-react";

type Props = {
  onSuccess: () => void;
};

export default function AddVisitButton({ onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        <CalendarCheck size={18} />+
        Catat Kunjungan
      </button>


      {isOpen && (
        <AddVisitModal
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