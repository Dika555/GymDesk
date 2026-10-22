"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import EditMembershipModal from "@/components/memberships/[id]/EditMembershipModal";
import Search from "@/components/ui/Search";
import Pagination from "@/components/ui/Pagination";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { logActivity } from "@/lib/activity-log";
import {
    ArrowLeft,
    ArrowUpRight,
    CreditCard,
    Pencil,
    Power,
    PowerOff,
    Gift,
    Users,
    Check,
    Trash2,
} from "lucide-react";

type MembershipPlan = {
    id: string;
    name: string;
    duration: number;
    price: number;
    benefits: string[];
    is_active: boolean;
};

type MemberSubscription = {
    id: string;
    start_date: string;
    end_date: string;
    status: string;
    created_at: string;
    member: {
        id: string;
        name: string;
        phone: string | null;
    } | null;
};

export default function MembershipDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();

    const planId = params.id as string;

    const [plan, setPlan] = useState<MembershipPlan | null>(null);
    const [subscribers, setSubscribers] = useState<MemberSubscription[]>([]);
    const [loading, setLoading] = useState(true);

    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDuration, setEditDuration] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editBenefits, setEditBenefits] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    type FeedbackType = "success" | "error" | "warning" | "info";

    const [feedback, setFeedback] = useState({
        open: false,
        title: "",
        message: "",
        type: "info" as FeedbackType,
    });

    function showFeedback(
        title: string,
        message: string,
        type: FeedbackType = "info"
    ) {
        setFeedback({
            open: true,
            title,
            message,
            type,
        });
    }

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        getDetail();
    }, [planId]);

    function handleEditClick() {
        if (!plan) return;

        setEditName(plan.name);
        setEditDuration(String(plan.duration));
        setEditPrice(String(plan.price));
        setEditBenefits(plan.benefits.join("\n"));
        setIsEditFormOpen(true);
    }

    async function handleUpdateMembership(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!plan) return;

        if (!editName.trim() || !editDuration || !editPrice) {
            showFeedback(
                "Data Belum Lengkap",
                "Nama, durasi, dan harga wajib diisi.",
                "warning"
            );
            return;
        }

        const duration = Number(editDuration);
        const price = Number(editPrice);

        if (
            !Number.isInteger(duration) ||
            duration <= 0 ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            showFeedback(
                "Data Tidak Valid",
                "Durasi harus berupa bilangan bulat positif dan harga tidak boleh negatif.",
                "warning"
            );
            return;
        }

        setIsSavingEdit(true);

        try {
            const branchId = await getActiveBranchId();

            if (!branchId) {
                showFeedback(
                    "Cabang Tidak Ditemukan",
                    "Cabang aktif tidak ditemukan. Periksa pilihan cabang terlebih dahulu.",
                    "error"
                );
                return;
            }

            const benefits = editBenefits
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean);

            const changes: string[] = [];

            if (plan.name !== editName.trim()) {
                changes.push(`Nama: "${plan.name}" → "${editName.trim()}"`);
            }

            if (plan.duration !== duration) {
                changes.push(`Durasi: ${plan.duration} hari → ${duration} hari`);
            }

            if (Number(plan.price) !== price) {
                changes.push(`Harga: ${plan.price} → ${price}`);
            }

            const oldBenefits = (plan.benefits ?? []).join(", ");
            const newBenefits = benefits.join(", ");

            if (oldBenefits !== newBenefits) {
                changes.push(
                    `Manfaat: "${oldBenefits || "-"}" → "${newBenefits || "-"}"`
                );
            }

            const { data, error } = await supabase
                .from("membership_plans")
                .update({
                    name: editName.trim(),
                    duration,
                    price,
                    benefits,
                })
                .eq("id", planId)
                .eq("branch_id", branchId)
                .select()
                .maybeSingle();

            if (error) {
                console.error("Gagal mengubah membership:", error);

                showFeedback(
                    "Gagal Menyimpan Perubahan",
                    "Paket membership gagal diperbarui. Silakan coba kembali.",
                    "error"
                );
                return;
            }

            if (!data) {
                showFeedback(
                    "Data Tidak Ditemukan",
                    "Paket membership tidak ditemukan pada cabang aktif.",
                    "warning"
                );
                return;
            }

            setPlan((prev) =>
                prev
                    ? {
                        ...prev,
                        name: data.name,
                        duration: data.duration,
                        price: data.price,
                        benefits: data.benefits ?? [],
                    }
                    : prev
            );

            if (changes.length > 0) {
                await logActivity({
                    action: "UPDATE",
                    description: `Mengubah paket membership "${data.name}": ${changes.join("; ")}`,
                    branchId,
                });
            }

            setIsEditFormOpen(false);

            showFeedback(
                "Perubahan Berhasil",
                "Data paket membership berhasil diperbarui.",
                "success"
            );
        } catch (error) {
            console.error("Terjadi kesalahan:", error);

            showFeedback(
                "Terjadi Kesalahan",
                "Terjadi kesalahan saat memperbarui paket membership.",
                "error"
            );
        } finally {
            setIsSavingEdit(false);
        }
    }

    async function handleToggleMembership() {
        if (!plan) return;

        const branchId = await getActiveBranchId();

        if (!branchId) {
            showFeedback(
                "Cabang Tidak Ditemukan",
                "Cabang aktif tidak ditemukan. Periksa pilihan cabang terlebih dahulu.",
                "error"
            );
            return;
        }

        const newStatus = !plan.is_active;

        try {
            const { data, error } = await supabase
                .from("membership_plans")
                .update({ is_active: newStatus })
                .eq("id", planId)
                .eq("branch_id", branchId)
                .select()
                .maybeSingle();

            if (error) {
                console.error("Gagal mengubah status membership:", error);

                showFeedback(
                    "Gagal Mengubah Status",
                    "Status paket membership gagal diperbarui. Silakan coba kembali.",
                    "error"
                );
                return;
            }

            if (!data) {
                showFeedback(
                    "Data Tidak Ditemukan",
                    "Paket membership tidak ditemukan pada cabang aktif.",
                    "warning"
                );
                return;
            }

            setPlan((prev) =>
                prev ? { ...prev, is_active: newStatus } : prev
            );

            await logActivity({
                action: newStatus ? "ACTIVATE" : "DEACTIVATE",
                description: newStatus
                    ? `Mengaktifkan paket membership: ${data.name}`
                    : `Menonaktifkan paket membership: ${data.name}`,
                branchId,
            });

            showFeedback(
                "Status Berhasil Diubah",
                newStatus
                    ? "Paket membership berhasil diaktifkan."
                    : "Paket membership berhasil dinonaktifkan.",
                "success"
            );
        } catch (error) {
            console.error("Terjadi kesalahan:", error);

            showFeedback(
                "Terjadi Kesalahan",
                "Terjadi kesalahan saat mengubah status paket membership.",
                "error"
            );
        }
    }

    async function handleDeleteMembership() {
        if (!plan || isDeleting) return;

        const branchId = await getActiveBranchId();

        if (!branchId) {
            showFeedback(
                "Cabang Tidak Ditemukan",
                "Cabang aktif tidak ditemukan. Periksa pilihan cabang terlebih dahulu.",
                "error"
            );
            return;
        }

        setIsDeleting(true);

        try {
            const { count, error: checkError } = await supabase
                .from("memberships")
                .select("*", { count: "exact", head: true })
                .eq("plan_id", planId)
                .eq("branch_id", branchId);

            if (checkError) {
                console.error("Gagal memeriksa membership.");
                showFeedback(
                    "Gagal Memeriksa Data",
                    "Penggunaan paket tidak dapat diperiksa. Silakan coba kembali.",
                    "error"
                );
                return;
            }

            if ((count ?? 0) > 0) {
                showFeedback(
                    "Paket Tidak Bisa Dihapus",
                    "Paket ini masih memiliki riwayat membership. Nonaktifkan paket jika sudah tidak ingin digunakan.",
                    "warning"
                );
                return;
            }

            setIsDeleteConfirmOpen(true);
        } catch (error) {
            console.error("Gagal memproses membership.");
            showFeedback(
                "Terjadi Kesalahan",
                "Terjadi kesalahan saat memeriksa paket membership.",
                "error"
            );
        } finally {
            setIsDeleting(false);
        }
    }

    async function confirmDeleteMembership() {
        if (!plan || isDeleting) return;

        setIsDeleting(true);

        try {
            const branchId = await getActiveBranchId();

            if (!branchId) {
                setIsDeleteConfirmOpen(false);
                showFeedback(
                    "Cabang Tidak Ditemukan",
                    "Cabang aktif tidak ditemukan. Periksa pilihan cabang terlebih dahulu.",
                    "error"
                );
                return;
            }

            const { data, error } = await supabase
                .from("membership_plans")
                .delete()
                .eq("id", planId)
                .eq("branch_id", branchId)
                .select("id")
                .maybeSingle();

            if (error) {
                console.error("Gagal memperbarui membership.");
                setIsDeleteConfirmOpen(false);
                showFeedback(
                    "Gagal Menghapus Paket",
                    "Paket membership gagal dihapus. Periksa apakah paket masih digunakan oleh data lain.",
                    "error"
                );
                return;
            }

            if (!data) {
                setIsDeleteConfirmOpen(false);
                showFeedback(
                    "Data Tidak Ditemukan",
                    "Paket membership tidak ditemukan pada cabang aktif.",
                    "warning"
                );
                return;
            }

            await logActivity({
                action: "DELETE",
                description: `Menghapus paket membership: ${plan.name}`,
                branchId,
            });

            setIsDeleteConfirmOpen(false);
            router.push("/membership?deleted=success");
        } catch (error) {
            console.error("Gagal menyimpan perubahan membership.");
            setIsDeleteConfirmOpen(false);
            showFeedback(
                "Terjadi Kesalahan",
                "Terjadi kesalahan saat menghapus paket membership.",
                "error"
            );
        } finally {
            setIsDeleting(false);
        }
    }

    async function getDetail() {
        setLoading(true);

        const branchId = await getActiveBranchId();

        if (!branchId) {
            setLoading(false);
            return;
        }

        const { data: planData, error } = await supabase
            .from("membership_plans")
            .select("id, name, duration, price, benefits, is_active")
            .eq("id", planId)
            .eq("branch_id", branchId)
            .single();

        if (error || !planData) {
            console.error("Gagal mengambil detail membership:", error);
            setLoading(false);
            return;
        }

        setPlan(planData);

        const { data: membershipData } = await supabase
            .from("memberships")
            .select("id, member_id, start_date, end_date, status, created_at")
            .eq("plan_id", planId)
            .eq("branch_id", branchId)
            .order("created_at", { ascending: false });

        const { data: memberData } = await supabase
            .from("members")
            .select("id, name, phone")
            .eq("branch_id", branchId);

        const combined =
            membershipData?.map((membership) => {
                const member = memberData?.find(
                    (member) => member.id === membership.member_id
                );

                return {
                    ...membership,
                    member: member ?? null,
                };
            }) ?? [];

        setSubscribers(combined);
        setLoading(false);
    }

    const filteredSubscribers = subscribers.filter((subscription) => {
        const keyword = search.toLowerCase();

        const name = subscription.member?.name ?? "";
        const phone = subscription.member?.phone ?? "";

        const matchesSearch =
            name.toLowerCase().includes(keyword) ||
            phone.toLowerCase().includes(keyword);

        const matchesStatus =
            statusFilter === "all" ||
            getMembershipStatus(subscription) === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(
        filteredSubscribers.length / ITEMS_PER_PAGE
    );

    const paginatedSubscribers = filteredSubscribers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <main className="p-8">
                <p className="text-sm text-zinc-500">
                    Memuat data membership...
                </p>
            </main>
        );
    }

    if (!plan) {
        return (
            <main className="p-8">
                <button
                    type="button"
                    onClick={() => router.push("/membership")}
                    className="mb-6 text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                    ← Kembali ke Membership
                </button>

                <div className="rounded-lg border bg-white p-8 text-center">
                    <p className="text-sm text-zinc-500">
                        Paket membership tidak ditemukan.
                    </p>
                </div>
            </main>
        );
    }

    function getMembershipStatus(subscription: MemberSubscription) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = new Date(`${subscription.end_date}T00:00:00`);

        if (
            subscription.status !== "active" ||
            endDate < today
        ) {
            return "inactive";
        }

        return "active";
    }

    return (
        <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 sm:p-8">
            {/* HEADER */}
            <div className="mb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                            <CreditCard size={28} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                                {plan.name}
                            </h1>

                            <p className="mt-1 text-sm text-zinc-500 sm:text-base">
                                Rp {plan.price.toLocaleString("id-ID")} / {plan.duration} bulan
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/membership")}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                        <ArrowLeft size={16} />
                        Kembali ke Membership
                    </button>
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleEditClick}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                    >
                        <Pencil size={16} />
                        Edit Membership
                    </button>

                    <button
                        type="button"
                        onClick={handleToggleMembership}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${plan.is_active
                            ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                            : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                            }`}
                    >
                        {plan.is_active ? (
                            <PowerOff size={16} />
                        ) : (
                            <Power size={16} />
                        )}

                        {plan.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </button>

                    {!plan.is_active && (
                        <button
                            type="button"
                            onClick={handleDeleteMembership}
                            disabled={isDeleting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Trash2 size={16} />
                            {isDeleting ? "Memeriksa..." : "Hapus"}
                        </button>
                    )}
                </div>
            </div>


            {/* SECTION BENEFIT MEMBERSHIP */}
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                {/* HEADER SECTION */}
                <div className="mb-5 flex items-center gap-3 border-b border-zinc-200 pb-5">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-zinc-700">
                        <Gift size={20} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">
                            Benefit Membership
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Daftar fasilitas yang didapatkan oleh member.
                        </p>
                    </div>
                </div>

                {/* DAFTAR BENEFIT */}
                {plan.benefits && plan.benefits.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {plan.benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-100 p-4 transition-colors hover:bg-zinc-100"
                            >
                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                                    <Check size={14} />
                                </div>

                                <p className="text-sm leading-6 text-zinc-700">
                                    {benefit}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center">
                        <p className="text-sm font-medium text-zinc-600">
                            Belum ada benefit membership.
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Tambahkan benefit melalui tombol Edit Membership.
                        </p>
                    </div>
                )}
            </div>


            {/* SECTION MEMBER YANG BERLANGGANAN */}
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                {/* HEADER SECTION */}
                <div className="mb-5 flex items-center gap-3 border-b border-zinc-200 pb-5">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-zinc-700">
                        <Users size={20} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">
                            Member yang Berlangganan
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Daftar member yang menggunakan paket membership ini.
                        </p>
                    </div>
                </div>

                {/* PENCARIAN DAN FILTER */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                        <Search
                            value={search}
                            onChange={(value) => {
                                setSearch(value);
                                setCurrentPage(1);
                            }}
                            placeholder="Cari nama atau no. HP member..."
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 sm:w-48"
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                    </select>
                </div>

                {/* TABEL MEMBER */}
                {filteredSubscribers.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-zinc-200">
                        <table className="w-full min-w-[800px] text-left">
                            <thead>
                                <tr className="border-b-2 border-zinc-200 bg-zinc-100">
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                        No
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                        Nama
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                        No. HP
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                        Mulai
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                        Berakhir
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                        Status
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-100">
                                {paginatedSubscribers.map((subscription, index) => {
                                    const status = getMembershipStatus(subscription);
                                    const isActive = status === "active";

                                    return (
                                        <tr
                                            key={subscription.id}
                                            className="transition-colors hover:bg-zinc-50"
                                        >
                                            <td className="px-4 py-4 text-sm text-zinc-500">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>

                                            <td className="px-4 py-4 text-sm font-semibold text-zinc-900">
                                                {subscription.member?.name ?? "-"}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-zinc-600">
                                                {subscription.member?.phone ?? "-"}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-zinc-600">
                                                {new Date(
                                                    subscription.start_date
                                                ).toLocaleDateString("id-ID")}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-zinc-600">
                                                {new Date(
                                                    subscription.end_date
                                                ).toLocaleDateString("id-ID")}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${isActive
                                                        ? "bg-green-50 text-green-700 ring-green-200"
                                                        : "bg-red-50 text-red-700 ring-red-200"
                                                        }`}
                                                >
                                                    {isActive ? "Aktif" : "Tidak Aktif"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                {subscription.member ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.push(`/members/${subscription.member!.id}`)
                                                        }
                                                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-50"
                                                    >
                                                        <ArrowUpRight size={16} />
                                                        Detail
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
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                            <Users size={22} />
                        </div>

                        <p className="text-sm font-semibold text-zinc-700">
                            {search || statusFilter !== "all"
                                ? "Member tidak ditemukan."
                                : "Belum ada member yang berlangganan paket ini."}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                            {search || statusFilter !== "all"
                                ? "Coba ubah kata kunci atau filter status."
                                : "Daftar member akan muncul di sini setelah berlangganan."}
                        </p>
                    </div>
                )}

                {isDeleteConfirmOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
                        <section
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="delete-membership-title"
                            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <Trash2 size={24} />
                            </div>

                            <h2
                                id="delete-membership-title"
                                className="mt-4 text-lg font-bold text-zinc-900"
                            >
                                Hapus Paket Membership?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-zinc-600">
                                Yakin ingin menghapus paket{" "}
                                <span className="font-semibold text-zinc-900">
                                    "{plan?.name}"
                                </span>
                                ? Tindakan ini tidak dapat dibatalkan.
                            </p>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={confirmDeleteMembership}
                                    className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {/* PAGINATION */}
                <div className="mt-5">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredSubscribers.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* MODAL EDIT MEMBERSHIP */}
            <EditMembershipModal
                open={isEditFormOpen}
                name={editName}
                duration={editDuration}
                price={editPrice}
                benefits={editBenefits}
                saving={isSavingEdit}
                onClose={() => setIsEditFormOpen(false)}
                onNameChange={setEditName}
                onDurationChange={setEditDuration}
                onPriceChange={setEditPrice}
                onBenefitsChange={setEditBenefits}
                onSubmit={handleUpdateMembership}
            />

            <FeedbackModal
                open={feedback.open}
                title={feedback.title}
                message={feedback.message}
                type={feedback.type}
                onClose={() =>
                    setFeedback((prev) => ({
                        ...prev,
                        open: false,
                    }))
                }
            />
        </main>
    );
}