import type { FormEventHandler } from "react";

type Props = {
    name: string;
    phone: string;
    specialization: string;
    pricePerSession: string;
    loading: boolean;

    onNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onSpecializationChange: (value: string) => void;
    onPricePerSessionChange: (value: string) => void;

    onSubmit: FormEventHandler<HTMLFormElement>;
};

export default function TrainerForm({
    name,
    phone,
    specialization,
    pricePerSession,
    loading,
    onNameChange,
    onPhoneChange,
    onSpecializationChange,
    onPricePerSessionChange,
    onSubmit,
}: Props) {
    return (
        <form
            id="trainer-form"
            onSubmit={onSubmit}
            className="space-y-4"
        >
            <div>
                <label className="mb-1 block text-sm font-medium">
                    Nama Trainer
                </label>
                <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    required
                    className="w-full rounded-lg border p-3"
                    placeholder="Masukkan nama trainer"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Nomor HP
                </label>
                <input
                    type="text"
                    name="phone"
                    value={phone}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    required
                    className="w-full rounded-lg border p-3"
                    placeholder="08xxxxxxxxxx"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Spesialisasi
                </label>
                <input
                    type="text"
                    name="specialization"
                    value={specialization}
                    onChange={(e) => onSpecializationChange(e.target.value)}
                    required
                    className="w-full rounded-lg border p-3"
                    placeholder="Contoh: Personal Trainer"
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