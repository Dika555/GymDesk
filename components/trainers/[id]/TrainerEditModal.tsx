import TrainerEditForm from "@/components/trainers/[id]/TrainerEditForm";
import Modal from "@/components/ui/Modal";
import type { FormEventHandler } from "react";

type Props = {
  name: string;
  phone: string;
  specialization: string;
  pricePerSession: string;
  onPricePerSessionChange: (value: string) => void;

  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSpecializationChange: (value: string) => void;

  onSubmit: FormEventHandler<HTMLFormElement>;
  onClose: () => void;
};

export default function TrainerEditModal({
  name,
  phone,
  specialization,
  pricePerSession,
  onNameChange,
  onPhoneChange,
  onSpecializationChange,
  onPricePerSessionChange,
  onSubmit,
  onClose,
}: Props) {
  return (
    <Modal
      title="Edit Trainer"
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
            form="trainer-edit-form"
            className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
          >
            Simpan Perubahan
          </button>
        </div>
      }
    >
      <TrainerEditForm
        name={name}
        phone={phone}
        specialization={specialization}
        pricePerSession={pricePerSession}
        onNameChange={onNameChange}
        onPhoneChange={onPhoneChange}
        onSpecializationChange={onSpecializationChange}
        onPricePerSessionChange={onPricePerSessionChange}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}