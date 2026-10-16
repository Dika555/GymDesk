
import TrainerSessionForm from "@/components/trainers/[id]/TrainerSessionForm";
import Modal from "@/components/ui/Modal";

type PackageMember = {
    id: string;
    member_name: string;
    package_name: string;
    remaining_sessions: number;
    status: string;
};

type Props = {
    sessionType: "package" | "single";
    sessionPackageMemberId: string;
    sessionDate: string;
    sessionNotes: string;
    sessionPaymentMethod: string;
    sessionVisitorName: string;

    packageMembers: PackageMember[];
    savingSession: boolean;

    onSessionTypeChange: (
        value: "package" | "single"
    ) => void;
    onPackageMemberChange: (value: string) => void;
    onDateChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    onPaymentMethodChange: (value: string) => void;
    onVisitorNameChange: (value: string) => void;

    onSubmit: React.FormEventHandler<HTMLFormElement>;
    onClose: () => void;
};

export default function TrainerSessionModal({
    sessionType,
    sessionPackageMemberId,
    sessionDate,
    sessionNotes,
    sessionPaymentMethod,
    sessionVisitorName,
    packageMembers,
    savingSession,
    onSessionTypeChange,
    onPackageMemberChange,
    onDateChange,
    onNotesChange,
    onPaymentMethodChange,
    onVisitorNameChange,
    onSubmit,
    onClose,
}: Props) {
    return (
        <Modal
            title="Catat Sesi Trainer"
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
                        form="trainer-session-form"
                        disabled={savingSession}
                        className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                        {savingSession
                            ? "Menyimpan..."
                            : "Simpan Sesi"}
                    </button>
                </div>
            }
        >
            <TrainerSessionForm
                sessionType={sessionType}
                sessionPackageMemberId={
                    sessionPackageMemberId
                }
                sessionDate={sessionDate}
                sessionNotes={sessionNotes}
                sessionPaymentMethod={
                    sessionPaymentMethod
                }
                sessionVisitorName={
                    sessionVisitorName
                }
                packageMembers={packageMembers}
                onSessionTypeChange={
                    onSessionTypeChange
                }
                onPackageMemberChange={
                    onPackageMemberChange
                }
                onDateChange={onDateChange}
                onNotesChange={onNotesChange}
                onPaymentMethodChange={
                    onPaymentMethodChange
                }
                onVisitorNameChange={
                    onVisitorNameChange
                }
                onSubmit={onSubmit}
            />
        </Modal>
    );
}