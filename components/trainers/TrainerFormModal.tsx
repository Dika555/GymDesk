import TrainerForm from "@/components/trainers/TrainerForm";
import Modal from "@/components/ui/Modal";

type Props = {
    name: string;
    phone: string;
    specialization: string;
    loading: boolean;
    pricePerSession: string;
    onPricePerSessionChange: (value: string) => void;

    onNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onSpecializationChange: (value: string) => void;

    onSubmit: React.FormEventHandler<HTMLFormElement>;
    onClose: () => void;
};

export default function TrainerFormModal({
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
    onClose,
}: Props) {
    return (
        <Modal
            title="Tambah Trainer"
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
                        form="trainer-form"
                        disabled={loading}
                        className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                        {loading
                            ? "Menyimpan..."
                            : "Simpan Trainer"}
                    </button>
                </div>
            }
        >
            <TrainerForm
                name={name}
                phone={phone}
                specialization={specialization}
                pricePerSession={pricePerSession}
                loading={loading}
                onNameChange={onNameChange}
                onPhoneChange={onPhoneChange}
                onSpecializationChange={onSpecializationChange}
                onPricePerSessionChange={onPricePerSessionChange}
                onSubmit={onSubmit}
            />
        </Modal>
    );
}