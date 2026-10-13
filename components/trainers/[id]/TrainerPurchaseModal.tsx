import TrainerPurchaseForm from "@/components/trainers/[id]/TrainerPurchaseForm";
import Modal from "@/components/Modal";

type Member = {
    id: string;
    name: string;
};

type TrainerPackage = {
    id: string;
    name: string;
    session_count: number;
    price: number;
};

type Props = {
    members: Member[];
    packages: TrainerPackage[];

    purchaseMemberId: string;
    purchasePackageId: string;
    purchaseDate: string;
    purchasePaymentMethod: string;
    purchaseNotes: string;

    savingPurchase: boolean;

    onMemberChange: (value: string) => void;
    onPackageChange: (value: string) => void;
    onDateChange: (value: string) => void;
    onPaymentMethodChange: (value: string) => void;
    onNotesChange: (value: string) => void;

    onSubmit: React.FormEventHandler<HTMLFormElement>;
    onClose: () => void;
};

export default function TrainerPurchaseModal({
    members,
    packages,
    purchaseMemberId,
    purchasePackageId,
    purchaseDate,
    purchasePaymentMethod,
    purchaseNotes,
    savingPurchase,
    onMemberChange,
    onPackageChange,
    onDateChange,
    onPaymentMethodChange,
    onNotesChange,
    onSubmit,
    onClose,
}: Props) {
    return (
        <Modal
            title="Beli Paket Member"
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
                        form="trainer-purchase-form"
                        disabled={savingPurchase}
                        className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                        {savingPurchase
                            ? "Menyimpan..."
                            : "Beli Paket"}
                    </button>
                </div>
            }
        >
            <TrainerPurchaseForm
                members={members}
                packages={packages}
                purchaseMemberId={purchaseMemberId}
                purchasePackageId={purchasePackageId}
                purchaseDate={purchaseDate}
                purchasePaymentMethod={purchasePaymentMethod}
                purchaseNotes={purchaseNotes}
                onMemberChange={onMemberChange}
                onPackageChange={onPackageChange}
                onDateChange={onDateChange}
                onPaymentMethodChange={onPaymentMethodChange}
                onNotesChange={onNotesChange}
                onSubmit={onSubmit}
            />
        </Modal>
    );
}