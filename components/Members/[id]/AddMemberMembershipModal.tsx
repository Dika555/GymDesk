"use client";

import { useState } from "react";
import AddMemberMembershipForm from "@/components/members/[id]/AddMemberMembershipForm";
import Modal from "@/components/ui/Modal";
import FeedbackModal from "@/components/ui/FeedbackModal";

type FeedbackType = "success" | "error" | "warning" | "info";

type Props = {
  memberId: string;
  branchId: string;
  onClose: () => void;
  onSuccess: () => void;
  onFeedback: (
    title: string,
    message: string,
    type: FeedbackType
  ) => void;
};

export default function AddMemberMembershipModal({
  memberId,
  branchId,
  onClose,
  onSuccess,
  onFeedback,
}: Props) {
  const [saving, setSaving] = useState(false);

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
    onClose();

    onSuccess?.();

    showFeedback(
      "Membership Berhasil Ditambahkan",
      "Membership berhasil ditambahkan dan pembayaran berhasil dicatat.",
      "success"
    );
  }

  return (
    <>
      <Modal
        title="Tambah Membership"
        onClose={onClose}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              form="member-membership-form"
              disabled={saving}
              className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Membership"}
            </button>
          </div>
        }
      >
        <AddMemberMembershipForm
          memberId={memberId}
          branchId={branchId}
          onSuccess={onSuccess}
          onFeedback={onFeedback}
          onSavingChange={setSaving}
        />
      </Modal>

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