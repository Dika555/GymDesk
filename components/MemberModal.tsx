"use client";

import { useState } from "react";
import AddMemberForm from "@/components/AddMemberForm";
import Modal from "@/components/Modal";
import FeedbackModal from "@/components/FeedbackModal";

type Member = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  address: string | null;
  membership: string | null;
};

type FeedbackType = "success" | "error" | "warning" | "info";

type Props = {
  open: boolean;
  member?: Member | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function MemberModal({
  open,
  member,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = Boolean(member);

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
    setFeedback({ open: true, title, message, type });
  }

  function handleSuccess() {
    showFeedback(
      "Berhasil",
      isEditing
        ? "Data member berhasil diubah."
        : "Member berhasil didaftarkan.",
      "success"
    );

    onSuccess();
  }

  return (
    <>
      <Modal
        open={open}
        title={isEditing ? "Edit Member" : "Tambah Member"}
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
              form="member-form"
              className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
            >
              {isEditing ? "Simpan Perubahan" : "Daftarkan Member"}
            </button>
          </div>
        }
      >
        <AddMemberForm
          onSuccess={handleSuccess}
          onFeedback={showFeedback}
          member={member ?? undefined}
        />
      </Modal>

      <FeedbackModal
        open={feedback.open}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
        onClose={() =>
          setFeedback((prev) => ({ ...prev, open: false }))
        }
      />
    </>
  );
}