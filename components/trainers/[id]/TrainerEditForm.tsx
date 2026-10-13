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
};

export default function TrainerEditForm({
  name,
  phone,
  specialization,
  pricePerSession,
  onNameChange,
  onPhoneChange,
  onSpecializationChange,
  onPricePerSessionChange,
  onSubmit,
}: Props) {
  return (
    <form
      id="trainer-edit-form"
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Nama Trainer
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Nomor HP
        </label>

        <input
          type="text"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Spesialisasi
        </label>

        <input
          type="text"
          value={specialization}
          onChange={(e) => onSpecializationChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Harga per Sesi (Rp)
        </label>

        <input
          type="number"
          name="pricePerSession"
          min="0"
          step="1"
          value={pricePerSession}
          onChange={(e) =>
            onPricePerSessionChange(e.target.value)
          }
          required
          className="w-full rounded-lg border p-3"
          placeholder="Contoh: 100000"
        />
      </div>
    </form>
  );
}