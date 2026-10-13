import type { FormEvent } from "react";
import Select from "react-select";

type AvailableMember = {
    id: string;
    name: string;
};

type Props = {
    availableMembers: AvailableMember[];
    selectedMemberId: string;
    onMemberChange: (memberId: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function TrainerMemberForm({
    availableMembers,
    selectedMemberId,
    onMemberChange,
    onSubmit,
}: Props) {
    return (
        <form
            id="trainer-member-form"
            onSubmit={onSubmit}
            className="space-y-5"
        >
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Member
                </label>

                <Select
                    options={availableMembers.map((m) => ({
                        value: m.id,
                        label: m.name,
                    }))}
                    value={
                        availableMembers
                            .map((m) => ({ value: m.id, label: m.name }))
                            .find((m) => m.value === selectedMemberId) ?? null
                    }
                    onChange={(option) => onMemberChange(option?.value ?? "")}
                    placeholder="Cari nama member..."
                    isSearchable
                    styles={{
                        control: (base) => ({
                            ...base,
                            minHeight: "42px",
                            borderRadius: "8px",
                            borderColor: "#d4d4d8",
                            boxShadow: "none",
                        }),
                    }}
                />
            </div>
        </form>
    );
}