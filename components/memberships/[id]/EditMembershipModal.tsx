
"use client";

import Modal from "@/components/ui/Modal";

type Props = {
    open: boolean;
    name: string;
    duration: string;
    price: string;
    benefits: string;
    saving: boolean;
    onClose: () => void;
    onNameChange: (value: string) => void;
    onDurationChange: (value: string) => void;
    onPriceChange: (value: string) => void;
    onBenefitsChange: (value: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function EditMembershipModal({
    open,
    name,
    duration,
    price,
    benefits,
    saving,
    onClose,
    onNameChange,
    onDurationChange,
    onPriceChange,
    onBenefitsChange,
    onSubmit,
}: Props) {
    return (
        <Modal
            open={open}
            title="Edit Membership"
            onClose={onClose}
            maxWidth="max-w-md"
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
                        form="edit-membership-form"
                        disabled={saving}
                        className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            }
        >
            <div className="mb-5">
                <p className="text-sm text-zinc-500">
                    Ubah informasi paket membership.
                </p>
            </div>

            <form
                id="edit-membership-form"
                onSubmit={onSubmit}
                className="space-y-4"
            >
                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Nama Membership
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Durasi
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="1"
                            required
                            value={duration}
                            onChange={(e) => onDurationChange(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
                        />
                        <span className="text-sm text-zinc-500">bulan</span>
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Harga
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500">Rp</span>
                        <input
                            type="number"
                            min="0"
                            required
                            value={price}
                            onChange={(e) => onPriceChange(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Keuntungan
                    </label>
                    <textarea
                        value={benefits}
                        onChange={(e) => onBenefitsChange(e.target.value)}
                        rows={5}
                        placeholder={"Akses seluruh area gym\nFree locker\nKonsultasi trainer"}
                        className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                        Tulis satu keuntungan di setiap baris.
                    </p>
                </div>
            </form>
        </Modal>
    );
}