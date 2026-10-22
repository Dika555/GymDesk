
"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Search from "@/components/ui/Search";
import Pagination from "@/components/ui/Pagination";
import { ClipboardList, CircleAlert, Download } from "lucide-react";
import { logActivity } from "@/lib/activity-log";

type ActivityLog = {
    id: string;
    user_id: string | null;
    branch_id: string | null;
    action: string;
    description: string;
    created_at: string;
    users: { name: string | null } | null;
    branches: { name: string | null } | null;
};

type FilterOption = {
    id: string;
    name: string | null;
};

const ITEMS_PER_PAGE = 10;

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [branches, setBranches] = useState<FilterOption[]>([]);
    const [users, setUsers] = useState<FilterOption[]>([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedAction, setSelectedAction] = useState("");

    const loadLogs = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const supabase = createClient();

            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                setAllowed(false);
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from("users")
                .select("role, is_active")
                .eq("id", user.id)
                .single();

            if (
                profileError ||
                profile?.role !== "super_admin" ||
                !profile?.is_active
            ) {
                setAllowed(false);
                return;
            }

            setAllowed(true);

            const [
                { data: branchData, error: branchError },
                { data: userData, error: userError },
            ] = await Promise.all([
                supabase
                    .from("branches")
                    .select("id, name")
                    .order("name"),

                supabase
                    .from("users")
                    .select("id, name")
                    .order("name"),
            ]);

            if (branchError) throw branchError;
            if (userError) throw userError;

            setBranches((branchData ?? []) as FilterOption[]);
            setUsers((userData ?? []) as FilterOption[]);

            const { data, error: queryError } = await supabase
                .from("activity_logs")
                .select(`
          id,
          user_id,
          branch_id,
          action,
          description,
          created_at,
          users!activity_logs_user_id_fkey (name),
          branches!activity_logs_branch_id_fkey (name)
        `)
                .order("created_at", { ascending: false })
                .limit(1000);

            if (queryError) {
                throw queryError;
            }

            setLogs((data ?? []) as unknown as ActivityLog[]);
        } catch (err) {
            console.error("Gagal memuat log aktivitas:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Log aktivitas gagal dimuat. Silakan coba lagi."
            );
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadLogs();
    }, [loadLogs]);

    const filteredLogs = logs.filter((log) => {
        const keyword = search.trim().toLowerCase();

        // Filter periode
        const logDate = new Date(log.created_at);

        if (startDate) {
            const start = new Date(`${startDate}T00:00:00+07:00`);

            if (logDate < start) return false;
        }

        if (endDate) {
            const end = new Date(`${endDate}T23:59:59.999+07:00`);

            if (logDate > end) return false;
        }

        // Filter cabang
        if (selectedBranch && log.branch_id !== selectedBranch) {
            return false;
        }

        // Filter pengguna
        if (selectedUser && log.user_id !== selectedUser) {
            return false;
        }

        // Filter jenis aktivitas
        if (
            selectedAction &&
            log.action.toUpperCase() !== selectedAction
        ) {
            return false;
        }

        // Pencarian teks
        if (!keyword) return true;

        return [
            log.action,
            log.description,
            log.users?.name ?? "",
            log.branches?.name ?? "",
        ].some((value) => value.toLowerCase().includes(keyword));
    });

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    function formatDate(value: string) {
        return new Date(value).toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    async function exportLogs() {
        if (filteredLogs.length === 0) return;

        const escapeCsv = (value: string) =>
            `"${String(value).replace(/"/g, '""')}"`;

        const rows = [
            ["No.", "Waktu", "Pengguna", "Cabang", "Aktivitas", "Detail"],
            ...filteredLogs.map((log, index) => [
                String(index + 1),
                formatDate(log.created_at),
                log.users?.name ?? "Pengguna tidak tersedia",
                log.branches?.name ?? "—",
                log.action,
                log.description,
            ]),
        ];

        const csv =
            "\uFEFF" +
            rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "log-aktivitas.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        await logActivity({
            action: "EXPORT",
            description: `Mengekspor ${filteredLogs.length} catatan log aktivitas ke file log-aktivitas.csv.`,
            branchId: null,
        });
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 sm:p-8">
                <p className="text-sm text-zinc-500">
                    Memuat log aktivitas...
                </p>
            </main>
        );
    }

    if (!allowed) {
        return (
            <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 sm:p-8">
                <section className="rounded-xl border border-red-200 bg-white p-6">
                    <div className="flex items-start gap-3">
                        <CircleAlert
                            className="mt-0.5 shrink-0 text-red-600"
                            size={22}
                        />
                        <div>
                            <h1 className="font-semibold text-zinc-900">
                                Akses Ditolak
                            </h1>
                            <p className="mt-1 text-sm text-red-600">
                                Halaman ini hanya dapat diakses oleh Super Admin.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 sm:p-8">
            {/* Header halaman */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                        <ClipboardList size={26} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                            Log Aktivitas
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500 sm:text-base">
                            Lihat dan export riwayat aktivitas pengguna GymDesk.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={exportLogs}
                    disabled={filteredLogs.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Download size={18} />
                    Export
                </button>
            </div>

            {/* Filter dan pencarian */}
            <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                    {/* Pencarian */}
                    <div className="lg:col-span-6">
                        <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                            Cari Log
                        </label>

                        <Search
                            value={search}
                            onChange={(value) => {
                                setSearch(value);
                                setCurrentPage(1);
                            }}
                            placeholder="Cari nama, cabang, atau detail..."
                        />
                    </div>

                    {/* Baris pertama: Periode */}
                    <div className="lg:col-span-3">
                        <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                            Dari Tanggal
                        </label>

                        <input
                            type="date"
                            value={startDate}
                            max={endDate || undefined}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <div className="lg:col-span-3">
                        <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                            Sampai Tanggal
                        </label>

                        <input
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    {/* Baris kedua: Cabang */}
                    <div className="lg:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                            Cabang
                        </label>

                        <select
                            value={selectedBranch}
                            onChange={(e) => {
                                setSelectedBranch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="">Semua Cabang</option>

                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name ?? "Cabang tanpa nama"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Baris kedua: Pengguna */}
                    <div className="lg:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                            Pengguna
                        </label>

                        <select
                            value={selectedUser}
                            onChange={(e) => {
                                setSelectedUser(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="">Semua Pengguna</option>

                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name ?? "Pengguna tanpa nama"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Baris kedua: Jenis Aktivitas */}
                    <div className="lg:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                            Jenis Aktivitas
                        </label>

                        <select
                            value={selectedAction}
                            onChange={(e) => {
                                setSelectedAction(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="">Semua Aktivitas</option>

                            {[...new Set([
                                "LOGIN",
                                "LOGOUT",
                                "CREATE",
                                "UPDATE",
                                "DELETE",
                                "ACTIVATE",
                                "DEACTIVE",
                                "VIEW",
                                "EXPORT",
                                "PURCHASE",
                                "CANCEL",
                                ...logs.map((log) => log.action.toUpperCase()),
                            ])]
                                .sort()
                                .map((action) => (
                                    <option key={action} value={action}>
                                        {action}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

                {/* Footer filter */}
                <div className="mt-5 flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-zinc-500">
                        Menampilkan{" "}
                        <span className="font-semibold text-zinc-800">
                            {filteredLogs.length}
                        </span>{" "}
                        catatan sesuai filter.
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setStartDate("");
                            setEndDate("");
                            setSelectedBranch("");
                            setSelectedUser("");
                            setSelectedAction("");
                            setSearch("");
                            setCurrentPage(1);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                    >
                        Reset Filter
                    </button>
                </div>
            </div>

            {/* Pesan error */}
            {error && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-white p-4">
                    <CircleAlert
                        className="mt-0.5 shrink-0 text-red-600"
                        size={20}
                    />
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-900">
                            Gagal Memuat Log Aktivitas
                        </h2>
                        <p className="mt-1 break-words text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Tabel */}
            <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-left">
                        <thead>
                            <tr className="border-b-2 border-zinc-200 bg-zinc-100">
                                {[
                                    "No.",
                                    "Waktu",
                                    "Pengguna",
                                    "Cabang",
                                    "Aktivitas",
                                    "Detail",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-zinc-100">
                            {error ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-sm text-zinc-500"
                                    >
                                        Data aktivitas tidak dapat ditampilkan.
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-sm text-zinc-500"
                                    >
                                        {search.trim()
                                            ? "Aktivitas tidak ditemukan."
                                            : "Belum ada aktivitas yang tercatat."}
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log, index) => (
                                    <tr
                                        key={log.id}
                                        className="transition-colors hover:bg-zinc-50"
                                    >
                                        <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-500">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                                            {formatDate(log.created_at)}
                                        </td>

                                        <td className="px-4 py-4 text-sm font-semibold text-zinc-900">
                                            {log.users?.name ?? "Pengguna tidak tersedia"}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-zinc-600">
                                            {log.branches?.name ?? "—"}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                                {log.action}
                                            </span>
                                        </td>

                                        <td className="max-w-sm whitespace-normal break-words px-4 py-4 text-sm text-zinc-600">
                                            {log.description}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Pagination */}
            {!error && totalPages > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredLogs.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            )}

            <p className="mt-4 text-xs text-zinc-500">
                Menampilkan maksimal 1.000 catatan terbaru. Export mencakup seluruh hasil pencarian, bukan hanya halaman yang sedang dibuka.
            </p>
        </main>
    );
}
