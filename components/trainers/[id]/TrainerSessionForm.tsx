
import type { FormEventHandler } from "react";
import Select from "react-select";

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

    onSessionTypeChange: (value: "package" | "single") => void;
    onPackageMemberChange: (value: string) => void;
    onDateChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    onPaymentMethodChange: (value: string) => void;
    onVisitorNameChange: (value: string) => void;

    onSubmit: FormEventHandler<HTMLFormElement>;
};

export default function TrainerSessionForm({
    sessionType,
    sessionPackageMemberId,
    sessionDate,
    sessionNotes,
    sessionPaymentMethod,
    sessionVisitorName,
    packageMembers,
    onSessionTypeChange,
    onPackageMemberChange,
    onDateChange,
    onNotesChange,
    onPaymentMethodChange,
    onVisitorNameChange,
    onSubmit,
}: Props) {

    const activePackageMembers = packageMembers.filter(
        (item) =>
            item.status === "active" &&
            item.remaining_sessions > 0
    );
    return (
        <form
            id="trainer-session-form"
            onSubmit={onSubmit}
            className="space-y-5"
        >
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Tipe Sesi
                </label>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            onSessionTypeChange("package")
                        }
                        className={`rounded-lg border px-4 py-2 ${sessionType === "package"
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-gray-300"
                            }`}
                    >
                        Paket
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onSessionTypeChange("single")
                        }
                        className={`rounded-lg border px-4 py-2 ${sessionType === "single"
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-gray-300"
                            }`}
                    >
                        Sesi Satuan
                    </button>
                </div>
            </div>

            {/* Paket Member */}
            {sessionType === "package" ? (
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Paket Member
                    </label>

                    <Select
                        options={activePackageMembers.map((item) => ({
                            value: item.id,
                            label: `${item.member_name} — ${item.package_name} (${item.remaining_sessions} sesi tersisa)`,
                        }))}
                        value={activePackageMembers
                            .map((item) => ({
                                value: item.id,
                                label: `${item.member_name} — ${item.package_name} (${item.remaining_sessions} sesi tersisa)`,
                            }))
                            .find((item) => item.value === sessionPackageMemberId) ?? null}
                        onChange={(option) => onPackageMemberChange(option?.value ?? "")}
                        placeholder="Cari member atau paket..."
                        isSearchable
                        required
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
            ) : (
                <>
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Nama Pelanggan
                        </label>

                        <input
                            type="text"
                            value={sessionVisitorName}
                            onChange={(e) =>
                                onVisitorNameChange(e.target.value)
                            }
                            placeholder="Masukkan nama pelanggan"
                            required
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Metode Pembayaran
                        </label>

                        <select
                            value={sessionPaymentMethod}
                            onChange={(e) =>
                                onPaymentMethodChange(e.target.value)
                            }
                            required
                            className="w-full rounded-lg border px-3 py-2"
                        >
                            <option value="">
                                Pilih metode pembayaran
                            </option>
                            <option value="cash">Cash</option>
                            <option value="qris">QRIS</option>
                            <option value="transfer">Transfer</option>
                        </select>
                    </div>
                </>
            )}

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Tanggal Sesi
                </label>

                <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) =>
                        onDateChange(e.target.value)
                    }
                    required
                    className="w-full rounded-lg border px-3 py-2"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Catatan
                </label>

                <textarea
                    value={sessionNotes}
                    onChange={(e) =>
                        onNotesChange(e.target.value)
                    }
                    placeholder="Catatan sesi (opsional)"
                    rows={3}
                    className="w-full rounded-lg border px-3 py-2"
                />
            </div>
        </form>
    );
}
