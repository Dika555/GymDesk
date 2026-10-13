import type { FormEventHandler } from "react";
import Select from "react-select";
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

    onMemberChange: (value: string) => void;
    onPackageChange: (value: string) => void;
    onDateChange: (value: string) => void;
    onPaymentMethodChange: (value: string) => void;
    onNotesChange: (value: string) => void;

    onSubmit: FormEventHandler<HTMLFormElement>;
};

export default function TrainerPurchaseForm({
    members,
    packages,
    purchaseMemberId,
    purchasePackageId,
    purchaseDate,
    purchasePaymentMethod,
    purchaseNotes,
    onMemberChange,
    onPackageChange,
    onDateChange,
    onPaymentMethodChange,
    onNotesChange,
    onSubmit,
}: Props) {
    return (
        <form
            id="trainer-purchase-form"
            onSubmit={onSubmit}
            className="space-y-5"
        >
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Member
                </label>

                <Select
                    options={members.map((member) => ({
                        value: member.id,
                        label: member.name,
                    }))}
                    value={
                        members
                            .map((member) => ({
                                value: member.id,
                                label: member.name,
                            }))
                            .find(
                                (member) =>
                                    member.value === purchaseMemberId
                            ) ?? null
                    }
                    onChange={(option) =>
                        onMemberChange(option?.value ?? "")
                    }
                    placeholder="Cari nama member..."
                    isSearchable
                    noOptionsMessage={() => "Member tidak ditemukan"}
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

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Paket Sesi
                </label>

                <select
                    value={purchasePackageId}
                    onChange={(e) =>
                        onPackageChange(e.target.value)
                    }
                    required
                    className="w-full rounded-lg border px-3 py-2"
                >
                    <option value="">
                        Pilih paket sesi
                    </option>

                    {packages.map((pkg) => (
                        <option
                            key={pkg.id}
                            value={pkg.id}
                        >
                            {pkg.name} — {pkg.session_count} sesi
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Tanggal Pembelian
                </label>

                <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) =>
                        onDateChange(e.target.value)
                    }
                    required
                    className="w-full rounded-lg border px-3 py-2"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Metode Pembayaran
                </label>

                <select
                    value={purchasePaymentMethod}
                    onChange={(e) =>
                        onPaymentMethodChange(e.target.value)
                    }
                    required
                    className="w-full rounded-lg border px-3 py-2"
                >
                    <option value="">
                        Pilih metode pembayaran
                    </option>

                    <option value="cash">
                        Cash
                    </option>

                    <option value="qris">
                        QRIS
                    </option>

                    <option value="transfer">
                        Transfer
                    </option>
                </select>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Catatan
                </label>

                <textarea
                    value={purchaseNotes}
                    onChange={(e) =>
                        onNotesChange(e.target.value)
                    }
                    placeholder="Catatan pembelian (opsional)"
                    rows={3}
                    className="w-full rounded-lg border px-3 py-2"
                />
            </div>
        </form>
    );
}