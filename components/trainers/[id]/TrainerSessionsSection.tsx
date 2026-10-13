
"use client";

import {
    CalendarDays,
    ClipboardList,
    Footprints,
    RotateCcw,
} from "lucide-react";

import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import type { TrainerSession } from "@/components/trainers/[id]/types";

type TrainerSessionsSectionProps = {
    sessions: TrainerSession[];
    filteredSessions: TrainerSession[];
    paginatedSessions: TrainerSession[];

    sessionSearch: string;
    sessionTypeFilter: "all" | "package" | "single";
    sessionPaymentFilter: "all" | "cash" | "qris" | "transfer";
    sessionStartDate: string;
    sessionEndDate: string;
    sessionPage: number;
    sessionTotalPages: number;
    sessionsPerPage: number;

    onOpenForm: () => void;
    onSearchChange: (value: string) => void;
    onTypeFilterChange: (value: "all" | "package" | "single") => void;
    onPaymentFilterChange: (
        value: "all" | "cash" | "qris" | "transfer"
    ) => void;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onReset: () => void;
    onPageChange: (page: number) => void;
};

export default function TrainerSessionsSection({
    sessions,
    filteredSessions,
    paginatedSessions,
    sessionSearch,
    sessionTypeFilter,
    sessionPaymentFilter,
    sessionStartDate,
    sessionEndDate,
    sessionPage,
    sessionTotalPages,
    sessionsPerPage,
    onOpenForm,
    onSearchChange,
    onTypeFilterChange,
    onPaymentFilterChange,
    onStartDateChange,
    onEndDateChange,
    onReset,
    onPageChange,
}: TrainerSessionsSectionProps) {
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
                        <Footprints size={22} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">
                            Sesi Trainer
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Catat dan lihat riwayat sesi latihan bersama trainer.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onOpenForm}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
                >
                    <ClipboardList size={17} />
                    Catat Sesi
                </button>
            </div>

            {/* PENCARIAN DAN FILTER */}
            <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {/* SEARCH */}
                    <div className="min-w-0 md:col-span-2 xl:col-span-4">
                        <label className={labelClassName}>
                            Cari Sesi
                        </label>

                        <div className="mt-1.5">
                            <Search
                                value={sessionSearch}
                                onChange={onSearchChange}
                                placeholder="Cari nama, tanggal, atau catatan..."
                            />
                        </div>
                    </div>

                    {/* JENIS SESI */}
                    <div className="min-w-0">
                        <label className={labelClassName}>
                            Jenis Sesi
                        </label>

                        <select
                            value={sessionTypeFilter}
                            onChange={(event) =>
                                onTypeFilterChange(
                                    event.target.value as
                                        | "all"
                                        | "package"
                                        | "single"
                                )
                            }
                            className={filterClassName}
                        >
                            <option value="all">Semua Jenis</option>
                            <option value="package">Paket</option>
                            <option value="single">Per Sesi</option>
                        </select>
                    </div>

                    {/* PEMBAYARAN */}
                    <div className="min-w-0">
                        <label className={labelClassName}>
                            Pembayaran
                        </label>

                        <select
                            value={sessionPaymentFilter}
                            onChange={(event) =>
                                onPaymentFilterChange(
                                    event.target.value as
                                        | "all"
                                        | "cash"
                                        | "qris"
                                        | "transfer"
                                )
                            }
                            className={filterClassName}
                        >
                            <option value="all">Semua Pembayaran</option>
                            <option value="cash">Cash</option>
                            <option value="qris">QRIS</option>
                            <option value="transfer">Transfer</option>
                        </select>
                    </div>

                    {/* DARI TANGGAL */}
                    <div className="min-w-0">
                        <label className={labelClassName}>
                            Dari Tanggal
                        </label>

                        <input
                            type="date"
                            value={sessionStartDate}
                            onChange={(event) =>
                                onStartDateChange(event.target.value)
                            }
                            className={filterClassName}
                        />
                    </div>

                    {/* SAMPAI TANGGAL */}
                    <div className="min-w-0">
                        <label className={labelClassName}>
                            Sampai Tanggal
                        </label>

                        <input
                            type="date"
                            value={sessionEndDate}
                            onChange={(event) =>
                                onEndDateChange(event.target.value)
                            }
                            className={filterClassName}
                        />
                    </div>
                </div>

                {/* RESET FILTER */}
                <div className="mt-4 flex justify-end border-t border-zinc-200 pt-4">
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                    >
                        <RotateCcw size={15} />
                        Reset Filter
                    </button>
                </div>
            </div>

            {/* JUMLAH DATA */}
            <div className="mt-5 text-sm text-zinc-500">
                Menampilkan{" "}
                <span className="font-semibold text-zinc-700">
                    {filteredSessions.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-zinc-700">
                    {sessions.length}
                </span>{" "}
                sesi
            </div>

            {/* TABEL SESI */}
            <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200">
                {filteredSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                            <CalendarDays size={24} />
                        </div>

                        <h3 className="mt-3 text-sm font-semibold text-zinc-800">
                            Tidak Ada Sesi
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                            Tidak ada riwayat sesi yang sesuai dengan filter.
                        </p>
                    </div>
                ) : (
                    <table className="w-full min-w-[950px] table-fixed text-left text-sm">
                        <thead className="bg-zinc-100">
                            <tr className="border-b-2 border-zinc-200">
                                <th className="w-14 px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    No.
                                </th>

                                <th className="w-44 px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Pelanggan
                                </th>

                                <th className="w-28 px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Jenis
                                </th>

                                <th className="w-36 px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Tanggal Sesi
                                </th>

                                <th className="w-36 px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Harga
                                </th>

                                <th className="w-32 px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Pembayaran
                                </th>

                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Catatan
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-zinc-100">
                            {paginatedSessions.map((session, index) => (
                                <tr
                                    key={session.id}
                                    className="transition-colors hover:bg-zinc-50"
                                >
                                    <td className="whitespace-nowrap px-4 py-4 text-zinc-500">
                                        {(sessionPage - 1) * sessionsPerPage +
                                            index +
                                            1}
                                    </td>

                                    <td className="px-4 py-4 font-semibold text-zinc-900">
                                        {session.member_name}
                                    </td>

                                    <td className="px-4 py-4 text-zinc-600">
                                        {session.session_type === "package"
                                            ? "Paket"
                                            : "Per Sesi"}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-zinc-600">
                                        {new Date(
                                            session.session_date
                                        ).toLocaleDateString("id-ID")}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-zinc-600">
                                        Rp{" "}
                                        {Number(session.price).toLocaleString(
                                            "id-ID"
                                        )}
                                    </td>

                                    <td className="px-4 py-4 text-zinc-600">
                                        {session.payment_method
                                            ? session.payment_method.toUpperCase()
                                            : "-"}
                                    </td>

                                    <td className="px-4 py-4 text-zinc-600">
                                        <div
                                            className="max-w-[320px] truncate"
                                            title={session.notes ?? "-"}
                                        >
                                            {session.notes || "-"}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* PAGINATION */}
            {filteredSessions.length > 0 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={sessionPage}
                        totalPages={sessionTotalPages}
                        totalItems={filteredSessions.length}
                        itemsPerPage={sessionsPerPage}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </section>
    );
}
