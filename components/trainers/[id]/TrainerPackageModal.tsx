import TrainerPackageForm from "@/components/trainers/[id]/TrainerPackageForm";
import Modal from "@/components/ui/Modal";

type Props = {
    editingPackageId: string | null;
    packageName: string;
    packageSessionCount: string;
    packagePrice: string;
    savingPackage: boolean;

    onPackageNameChange: (value: string) => void;
    onPackageSessionCountChange: (value: string) => void;
    onPackagePriceChange: (value: string) => void;

    onSubmit: React.FormEventHandler<HTMLFormElement>;
    onClose: () => void;
};

export default function TrainerPackageModal({
    editingPackageId,
    packageName,
    packageSessionCount,
    packagePrice,
    savingPackage,
    onPackageNameChange,
    onPackageSessionCountChange,
    onPackagePriceChange,
    onSubmit,
    onClose,
}: Props) {
    return (
        <Modal
            title={
                editingPackageId
                    ? "Edit Paket Sesi"
                    : "Tambah Paket Sesi"
            }
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
                        form="trainer-package-form"
                        disabled={savingPackage}
                        className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                        {savingPackage
                            ? "Menyimpan..."
                            : editingPackageId
                              ? "Simpan Perubahan"
                              : "Simpan Paket"}
                    </button>
                </div>
            }
        >
            <TrainerPackageForm
                packageName={packageName}
                packageSessionCount={packageSessionCount}
                packagePrice={packagePrice}
                onPackageNameChange={onPackageNameChange}
                onPackageSessionCountChange={
                    onPackageSessionCountChange
                }
                onPackagePriceChange={onPackagePriceChange}
                onSubmit={onSubmit}
            />
        </Modal>
    );
}