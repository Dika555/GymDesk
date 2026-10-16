import TrainerMemberForm from "@/components/trainers/[id]/TrainerMemberForm";
import Modal from "@/components/ui/Modal";

type AvailableMember = {
    id: string;
    name: string;
};

type Props = {
    availableMembers: AvailableMember[];
    selectedMemberId: string;
    onMemberChange: (memberId: string) => void;
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    onClose: () => void;
    saving: boolean;
};

export default function TrainerMemberModal({
    availableMembers,
    selectedMemberId,
    onMemberChange,
    onSubmit,
    onClose,
    saving,
}: Props) {
    return (
        <Modal
            title="Tambah Member ke Trainer"
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
                        form="trainer-member-form"
                        disabled={saving}
                        className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                        {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            }
        >
            <div className="min-h-[380]">
            <TrainerMemberForm
                availableMembers={availableMembers}
                selectedMemberId={selectedMemberId}
                onMemberChange={onMemberChange}
                onSubmit={onSubmit}
            />
            </div>
        </Modal>
    );
}