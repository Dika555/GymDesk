
"use client";

import {
    BadgeCheck,
    CalendarDays,
    Package,
    PackagePlus,
    Search as SearchIcon,
    XCircle,
} from "lucide-react";

import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import TrainerPurchaseModal from "@/components/trainers/[id]/TrainerPurchaseModal";
import type {
    Trainer,
    TrainerPackage,
    TrainerMember,
    TrainerPackageMember,
} from "@/components/trainers/[id]/types";

type TrainerPackageMembersSectionProps = {
    trainer: Trainer;
    members: TrainerMember[];
    packages: TrainerPackage[];
    packageMembers: TrainerPackageMember[];
    filteredPackageMembers: TrainerPackageMember[];
    paginatedPackageMembers: TrainerPackageMember[];

    packageMemberSearch: string;
    packageMemberFilter: "all" | "active" | "history";
    packageMemberPage: number;
    packageMemberTotalPages: number;
    packageMembersPerPage: number;

    isPurchaseFormOpen: boolean;
    purchaseMemberId: string;
    purchasePackageId: string;
    purchaseDate: string;
    purchasePaymentMethod: string;
    purchaseNotes: string;
    savingPurchase: boolean;

    onSearchChange: (value: string) => void;
    onFilterChange: (value: "all" | "active" | "history") => void;
    onPageChange: (page: number) => void;

    onOpenForm: () => void;
    onMemberChange: (value: string) => void;
    onPackageChange: (value: string) => void;
    onDateChange: (value: string) => void;
    onPaymentMethodChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCloseForm: () => void;

    onCancelPackage: (id: string) => void;
};

export default function TrainerPackageMembersSection({
    trainer,
    members,
    packages,
    packageMembers,
    filteredPackageMembers,
    paginatedPackageMembers,
    packageMemberSearch,
    packageMemberFilter,
    packageMemberPage,
    packageMemberTotalPages,
    packageMembersPerPage,
    isPurchaseFormOpen,
    purchaseMemberId,
    purchasePackageId,
    purchaseDate,
    purchasePaymentMethod,
    purchaseNotes,
    savingPurchase,
    onSearchChange,
    onFilterChange,
    onPageChange,
    onOpenForm,
    onMemberChange,
    onPackageChange,
    onDateChange,
    onPaymentMethodChange,
    onNotesChange,
    onSubmit,
    onCloseForm,
    onCancelPackage,
}: TrainerPackageMembersSectionProps) {
    const filterClassName =
        "mt-1.5 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

    const labelClassName =
        "block text-xs font-semibold text-zinc-600";

    return (
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                        <Package size={22} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">
                            Paket Member
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Daftar paket PT yang dimiliki member.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onOpenForm}
                    disabled={trainer.status === "inactive"}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <PackagePlus size={17} />
                    Beli Paket
                </button>
            </div>

            {/* MODAL PEMBELIAN */}
            {isPurchaseFormOpen && (
                <TrainerPurchaseModal
                    members={members}
                    packages={packages}
                    purchaseMemberId={purchaseMemberId}
                    purchasePackageId={purchasePackageId}
                    purchaseDate={purchaseDate}
                    purchasePaymentMethod={purchasePaymentMethod}
                    purchaseNotes={purchaseNotes}
                    savingPurchase={savingPurchase}
                    onMemberChange={onMemberChange}
                    onPackageChange={onPackageChange}
                    onDateChange={onDateChange}
                    onPaymentMethodChange={onPaymentMethodChange}
                    onNotesChange={onNotesChange}
                    onSubmit={onSubmit}
                    onClose={onCloseForm}
                />
            )}

            {/* PENCARIAN DAN FILTER */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
                <div className="min-w-0">
                    <label className={labelClassName}>
                        Cari Paket Member
                    </label>

                    <div className="mt-1.5">
                        <Search
                            value={packageMemberSearch}
                            onChange={onSearchChange}
                            placeholder="Cari nama, paket, atau tanggal..."
                        />
                    </div>
                </div>

                <div className="min-w-0">
                    <label className={labelClassName}>
                        Filter Status
                    </label>

                    <select
                        value={packageMemberFilter}
                        onChange={(event) =>
                            onFilterChange(
                                event.target.value as
                                    | "all"
                                    | "active"
                                    | "history"
                            )
                        }
                        className={filterClassName}
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="history">Riwayat</option>
                    </select>
                </div>
            </div>

            {/* JUMLAH DATA */}
            <div className="mt-5 text-sm text-zinc-500">
                Menampilkan{" "}
                <span className="font-semibold text-zinc-700">
                    {filteredPackageMembers.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-zinc-700">
                    {packageMembers.length}
                </span>{" "}
                paket member
            </div>

            {/* TABEL PAKET MEMBER */}
            <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200">
                {packageMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                            <Package size={24} />
                        </div>

                        <h3 className="mt-3 text-sm font-semibold text-zinc-800">
                            Belum Ada Paket Member
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                            Belum ada member yang membeli paket sesi.
                        </p>
                    </div>
                ) : filteredPackageMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                            <SearchIcon size={24} />
                        </div>

                        <h3 className="mt-3 text-sm font-semibold text-zinc-800">
                            Paket Member Tidak Ditemukan
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                            Coba ubah kata kunci atau filter status.
                        </p>
                    </div>
                ) : (
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="bg-zinc-100">
                            <tr className="border-b-2 border-zinc-200">
                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    No.
                                </th>

                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Member
                                </th>

                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Paket
                                </th>

                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Sesi
                                </th>

                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Tanggal Beli
                                </th>

                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Status
                                </th>

                                <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-zinc-100">
                            {paginatedPackageMembers.map((item, index) => {
                                const isActive =
                                    item.status === "active" &&
                                    item.remaining_sessions > 0;

                                const isCancelled =
                                    item.status === "cancelled";

                                return (
                                    <tr
                                        key={item.id}
                                        className="transition-colors hover:bg-zinc-50"
                                    >
                                        <td className="whitespace-nowrap px-4 py-4 text-zinc-500">
                                            {(packageMemberPage - 1) *
                                                packageMembersPerPage +
                                                index +
                                                1}
                                        </td>

                                        <td className="px-4 py-4 font-semibold text-zinc-900">
                                            {item.member_name}
                                        </td>

                                        <td className="px-4 py-4 text-zinc-700">
                                            {item.package_name}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-zinc-600">
                                            {item.remaining_sessions} /{" "}
                                            {item.total_sessions}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-zinc-600">
                                            {new Date(
                                                item.purchase_date
                                            ).toLocaleDateString("id-ID")}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                                    isActive
                                                        ? "border-green-200 bg-green-50 text-green-700"
                                                        : isCancelled
                                                          ? "border-red-200 bg-red-50 text-red-700"
                                                          : "border-zinc-200 bg-zinc-100 text-zinc-600"
                                                }`}
                                            >
                                                {isActive
                                                    ? "Aktif"
                                                    : isCancelled
                                                      ? "Dibatalkan"
                                                      : "Selesai"}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-right">
                                            {item.status === "active" &&
                                            item.remaining_sessions ===
                                                item.total_sessions ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onCancelPackage(item.id)
                                                    }
                                                    disabled={
                                                        trainer.status ===
                                                        "inactive"
                                                    }
                                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <XCircle size={14} />
                                                    Batalkan
                                                </button>
                                            ) : (
                                                <span className="text-sm text-zinc-400">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* PAGINATION */}
            {filteredPackageMembers.length > 0 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={packageMemberPage}
                        totalPages={packageMemberTotalPages}
                        totalItems={filteredPackageMembers.length}
                        itemsPerPage={packageMembersPerPage}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </section>
    );
}
