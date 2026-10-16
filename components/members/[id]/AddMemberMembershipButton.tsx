"use client";

import { useState } from "react";
import AddMemberMembershipModal from "@/components/members/[id]/AddMemberMembershipModal";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { useRouter } from "next/navigation";
import {
  IdCard
} from "lucide-react";
type FeedbackType = "success" | "error" | "warning" | "info";

type Props = {
  memberId: string;
  branchId: string;
};

export default function AddMemberMembershipButton({
  memberId,
  branchId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [feedback, setFeedback] = useState({
    open: false,
    title: "",
    message: "",
    type: "info" as FeedbackType,
  });

  function showFeedback(
    title: string,
    message: string,
    type: FeedbackType = "info"
  ) {
    setFeedback({
      open: true,
      title,
      message,
      type,
    });
  }

  function handleSuccess() {
    setIsOpen(false);

    // Muat ulang data halaman Detail Member
    router.refresh();

    showFeedback(
      "Membership Berhasil Ditambahkan",
      "Membership berhasil ditambahkan dan pembayaran berhasil dicatat.",
      "success"
    );
  }

  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex shrink-0 items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 gap-2"
      >
        <IdCard size={18} />+
        Tambah Paket Membership
      </button>

      {isOpen && (
        <AddMemberMembershipModal
          memberId={memberId}
          branchId={branchId}
          onClose={() => setIsOpen(false)}
          onSuccess={handleSuccess}
          onFeedback={showFeedback}
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