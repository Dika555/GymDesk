
"use client";

import {
    Package,
    PackagePlus,
    Pencil,
    Power,
    PowerOff,
    Trash2,
} from "lucide-react";

import Search from "@/components/ui/Search";
import Pagination from "@/components/ui/Pagination";
import TrainerPackageModal from "@/components/trainers/[id]/TrainerPackageModal";
import type { TrainerPackage } from "@/components/trainers/[id]/types";

type TrainerPackagesSectionProps = {
    packages: TrainerPackage[];
    paginatedPackages: TrainerPackage[];
    trainerStatus: string;

    packageSearch: string;
    packageFilter: "all" | "active" | "inactive";
    packagePage: number;
    packageTotalPages: number;
    packagesPerPage: number;

    isPackageFormOpen: boolean;
    editingPackageId: string | null;
    packageName: string;
    packageSessionCount: string;
    packagePrice: string;
    savingPackage: boolean;

    onSearchChange: (value: string) => void;
    onFilterChange: (value: "all" | "active" | "inactive") => void;
    onPageChange: (page: number) => void;

    onOpenForm: () => void;
    onPackageNameChange: (value: string) => void;
    onPackageSessionCountChange: (value: string) => void;
    onPackagePriceChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCloseForm: () => void;

    onEdit: (item: TrainerPackage) => void;
    onDeactivate: (id: string) => void;
    onActivate: (id: string) => void;
    onDelete: (id: string) => void | Promise<void>;
};

export default function TrainerPackagesSection({
    packages,
    paginatedPackages,
    trainerStatus,
    packageSearch,
    packageFilter,
    packagePage,
    packageTotalPages,
    packagesPerPage,
    isPackageFormOpen,
    editingPackageId,
    packageName,
    packageSessionCount,
    packagePrice,
    savingPackage,
    onSearchChange,
    onFilterChange,
    onPageChange,
    onOpenForm,
    onPackageNameChange,
    onPackageSessionCountChange,
    onPackagePriceChange,
    onSubmit,
    onCloseForm,
    onEdit,
    onDeactivate,
    onActivate,
    onDelete,
}: TrainerPackagesSectionProps) {
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
                            Paket Sesi
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Daftar paket sesi yang tersedia untuk trainer ini.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onOpenForm}
                    disabled={trainerStatus === "inactive"}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <PackagePlus size={17} />
                    Tambah Paket
                </button>
            </div>

            {/* MODAL */}
            {isPackageFormOpen && (
                <TrainerPackageModal
                    editingPackageId={editingPackageId}
                    packageName={packageName}
                    packageSessionCount={packageSessionCount}
                    packagePrice={packagePrice}
                    savingPackage={savingPackage}
                    onPackageNameChange={onPackageNameChange}
                    onPackageSessionCountChange={onPackageSessionCountChange}
                    onPackagePriceChange={onPackagePriceChange}
                    onSubmit={onSubmit}
                    onClose={onCloseForm}
                />
            )}

            {/* SEARCH DAN FILTER */}
            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                    <Search
                        value={packageSearch}
                        onChange={onSearchChange}
                        placeholder="Cari nama paket..."
                    />
                </div>

                <select
                    value={packageFilter}
                    onChange={(event) =>
                        onFilterChange(
                            event.target.value as "all" | "active" | "inactive"
                        )
                    }
                    aria-label="Filter status paket"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 md:w-56"
                >
                    <option value="all">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                </select>
            </div>

            {/* TABEL */}
            <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-200">
                {packages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center bg-white px-4 py-10 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                            <Package size={24} />
                        </div>

                        <h3 className="mt-3 text-sm font-semibold text-zinc-800">
                            Belum Ada Paket Sesi
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                            Paket sesi untuk trainer ini belum tersedia.
                        </p>
                    </div>
                ) : (
                    <table className="w-full min-w-[800px] text-left text-sm">
                        <thead className="bg-zinc-100">
                            <tr className="border-b-2 border-zinc-200">
                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    No.
                                </th>
                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Nama Paket
                                </th>
                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Jumlah Sesi
                                </th>
                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Harga
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
                            {paginatedPackages.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="transition-colors hover:bg-zinc-50"
                                >
                                    <td className="whitespace-nowrap px-4 py-4 text-zinc-500">
                                        {(packagePage - 1) * packagesPerPage + index + 1}
                                    </td>

                                    <td className="px-4 py-4 font-semibold text-zinc-900">
                                        {item.name}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-zinc-600">
                                        {item.session_count} sesi
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-zinc-600">
                                        Rp {item.price.toLocaleString("id-ID")}
                                    </td>


                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${item.status === "active"
                                                ? "border-green-200 bg-green-50 text-green-700"
                                                : "border-zinc-200 bg-zinc-100 text-zinc-600"
                                                }`}
                                        >
                                            {item.status === "active" ? "Aktif" : "Nonaktif"}
                                        </span>
                                    </td>


                                    <td className="px-4 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(item)}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                                            >
                                                <Pencil size={14} />
                                                Edit
                                            </button>

                                            {item.status === "active" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => onDeactivate(item.id)}
                                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                                >
                                                    <PowerOff size={14} />
                                                    Nonaktifkan
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => onActivate(item.id)}
                                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                                                >
                                                    <Power size={14} />
                                                    Aktifkan
                                                </button>
                                            )}


                                            {item.status === "inactive" && (
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(item.id)}
                                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} />
                                                    Hapus
                                                </button>
                                            )}

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* PAGINATION */}
            {packages.length > 0 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={packagePage}
                        totalPages={packageTotalPages}
                        totalItems={packages.length}
                        itemsPerPage={packagesPerPage}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </section>
    );
}
