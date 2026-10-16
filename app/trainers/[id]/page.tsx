"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import TrainerProfileSection from "@/components/trainers/[id]/TrainerProfileSection";
import TrainerMembersSection from "@/components/trainers/[id]/TrainerMembersSection";
import TrainerPackagesSection from "@/components/trainers/[id]/TrainerPackagesSection";
import TrainerSessionsSection from "@/components/trainers/[id]/TrainerSessionsSection";
import TrainerPackageMembersSection from "@/components/trainers/[id]/TrainerPackageMembersSection";
import TrainerPackageModal from "@/components/trainers/[id]/TrainerPackageModal";
import TrainerSessionModal from "@/components/trainers/[id]/TrainerSessionModal";
import TrainerPurchaseModal from "@/components/trainers/[id]/TrainerPurchaseModal";
import TrainerEditModal from "@/components/trainers/[id]/TrainerEditModal";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import FeedbackModal from "@/components/FeedbackModal";
import type {
    Trainer,
    TrainerPackage,
    TrainerMember,
    AvailableMember,
    TrainerPackageMember,
    TrainerSession,
} from "@/components/trainers/[id]/types";


export default function TrainerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [loading, setLoading] = useState(true);
    const [packages, setPackages] = useState<TrainerPackage[]>([]);
    const [members, setMembers] = useState<TrainerMember[]>([]);
    const [availableMembers, setAvailableMembers] =
        useState<AvailableMember[]>([]);

    // Modal notifikasi
    const [feedback, setFeedback] = useState<{
        open: boolean;
        title: string;
        message: string;
        type: "success" | "error" | "warning" | "info";
    }>({
        open: false,
        title: "",
        message: "",
        type: "info",
    });

    // Modal konfirmasi
    const [confirmation, setConfirmation] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: (() => void | Promise<void>) | null;
    }>({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
    });

    function showFeedback(
        title: string,
        message: string,
        type: "success" | "error" | "warning" | "info" = "info"
    ) {
        setFeedback({ open: true, title, message, type });
    }

    function askConfirmation(
        title: string,
        message: string,
        onConfirm: () => void | Promise<void>
    ) {
        setConfirmation({ open: true, title, message, onConfirm });
    }

    function closeConfirmation() {
        setConfirmation({
            open: false,
            title: "",
            message: "",
            onConfirm: null,
        });
    }

    /* =========================
       MEMBER YANG DITANGANI
    ========================= */

    const [memberSearch, setMemberSearch] = useState("");
    const [memberFilter, setMemberFilter] = useState<
        "all" | "active" | "inactive"
    >("all");

    const [memberPage, setMemberPage] = useState(1);
    const membersPerPage = 5;

    const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);

    const [packagePage, setPackagePage] = useState(1);
    const packagesPerPage = 5;

    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [savingMember, setSavingMember] = useState(false);

    const filteredMembers = members.filter((item) => {
        const search = memberSearch.trim().toLowerCase();

        const matchesSearch = item.name.toLowerCase().includes(search);

        if (!matchesSearch) {
            return false;
        }

        if (memberFilter === "active") {
            return item.has_active_package;
        }

        if (memberFilter === "inactive") {
            return !item.has_active_package;
        }

        return true;
    });

    const memberTotalPages = Math.ceil(
        filteredMembers.length / membersPerPage
    );

    const paginatedMembers = filteredMembers.slice(
        (memberPage - 1) * membersPerPage,
        memberPage * membersPerPage
    );

    /* =========================
       PAKET MEMBER
    ========================= */

    const [packageMembers, setPackageMembers] = useState<
        TrainerPackageMember[]
    >([]);

    const [packageMemberSearch, setPackageMemberSearch] = useState("");

    const [packageMemberFilter, setPackageMemberFilter] = useState<
        "all" | "active" | "history"
    >("all");

    const [packageMemberPage, setPackageMemberPage] = useState(1);

    const packageMembersPerPage = 5;

    const filteredPackageMembers = packageMembers.filter((item) => {
        const search = packageMemberSearch.trim().toLowerCase();

        const formattedDate = new Date(
            item.purchase_date
        ).toLocaleDateString("id-ID");

        const matchesSearch =
            item.member_name.toLowerCase().includes(search) ||
            item.package_name.toLowerCase().includes(search) ||
            formattedDate.toLowerCase().includes(search) ||
            item.purchase_date.toLowerCase().includes(search);

        if (!matchesSearch) {
            return false;
        }

        if (packageMemberFilter === "active") {
            return (
                item.status === "active" &&
                item.remaining_sessions > 0
            );
        }

        if (packageMemberFilter === "history") {
            return (
                item.status === "completed" ||
                item.status === "cancelled" ||
                item.remaining_sessions <= 0
            );
        }

        return true;
    });

    const packageMemberTotalPages = Math.ceil(
        filteredPackageMembers.length / packageMembersPerPage
    );

    const paginatedPackageMembers = filteredPackageMembers.slice(
        (packageMemberPage - 1) * packageMembersPerPage,
        packageMemberPage * packageMembersPerPage
    );

    /* =========================
       SESI TRAINER
    ========================= */

    const [sessions, setSessions] = useState<TrainerSession[]>([]);

    const [sessionTypeFilter, setSessionTypeFilter] = useState<
        "all" | "package" | "single"
    >("all");

    const [sessionPaymentFilter, setSessionPaymentFilter] = useState<
        "all" | "cash" | "qris" | "transfer"
    >("all");

    const [sessionSearch, setSessionSearch] = useState("");
    const [sessionPage, setSessionPage] = useState(1);

    const sessionsPerPage = 5;

    const [sessionStartDate, setSessionStartDate] = useState("");
    const [sessionEndDate, setSessionEndDate] = useState("");

    const filteredSessions = sessions.filter((session) => {
        const search = sessionSearch.trim().toLowerCase();

        const formattedDate = new Date(
            session.session_date
        ).toLocaleDateString("id-ID");

        const matchesSearch =
            session.member_name.toLowerCase().includes(search) ||
            formattedDate.toLowerCase().includes(search) ||
            session.session_date.toLowerCase().includes(search) ||
            (session.notes ?? "").toLowerCase().includes(search);

        const matchesType =
            sessionTypeFilter === "all" ||
            session.session_type === sessionTypeFilter;

        const matchesPayment =
            sessionPaymentFilter === "all" ||
            session.payment_method === sessionPaymentFilter;

        const matchesStartDate =
            !sessionStartDate ||
            session.session_date >= sessionStartDate;

        const matchesEndDate =
            !sessionEndDate ||
            session.session_date <= sessionEndDate;

        return (
            matchesSearch &&
            matchesType &&
            matchesPayment &&
            matchesStartDate &&
            matchesEndDate
        );
    });

    const sessionTotalPages = Math.ceil(
        filteredSessions.length / sessionsPerPage
    );

    const paginatedSessions = filteredSessions.slice(
        (sessionPage - 1) * sessionsPerPage,
        sessionPage * sessionsPerPage
    );

    /* =========================
       EDIT TRAINER
    ========================= */

    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [pricePerSession, setPricePerSession] = useState("");

    const [saving, setSaving] = useState(false);

    /* =========================
       PAKET TRAINER
    ========================= */

    const [isPackageFormOpen, setIsPackageFormOpen] = useState(false);

    const [packageName, setPackageName] = useState("");
    const [packageSessionCount, setPackageSessionCount] = useState("");
    const [packagePrice, setPackagePrice] = useState("");
    const [savingPackage, setSavingPackage] = useState(false);
    const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

    const [packageSearch, setPackageSearch] = useState("");
    const [packageFilter, setPackageFilter] = useState<
        "all" | "active" | "inactive"
    >("all");

    const filteredPackages = packages.filter((item) => {
        const keyword = packageSearch.trim().toLowerCase();

        const matchesSearch = item.name
            .toLowerCase()
            .includes(keyword);

        const matchesStatus =
            packageFilter === "all" ||
            item.status === packageFilter;

        return matchesSearch && matchesStatus;
    });

    const packageTotalPages = Math.ceil(
        filteredPackages.length / packagesPerPage
    );

    const paginatedPackages = filteredPackages.slice(
        (packagePage - 1) * packagesPerPage,
        packagePage * packagesPerPage
    );


    async function deleteTrainer() {
        if (!trainer || trainer.status !== "inactive") {
            showFeedback(
                "Tidak Dapat Menghapus",
                "Hanya trainer nonaktif yang dapat dihapus.",
                "warning"
            );
            return;
        }

        const supabase = createClient();
        const branchId = getActiveBranchId();

        if (!branchId) {
            showFeedback(
                "Cabang Belum Dipilih",
                "Cabang aktif belum dipilih.",
                "warning"
            );
            return;
        }

        setSaving(true);

        try {
            // Pastikan trainer masih ada di cabang aktif
            const { data: foundTrainer, error: findError } = await supabase
                .from("trainers")
                .select("id, name, status")
                .eq("id", trainer.id)
                .eq("branch_id", branchId)
                .maybeSingle();

            if (findError) throw findError;

            if (!foundTrainer) {
                showFeedback(
                    "Trainer Tidak Ditemukan",
                    "Trainer tidak ditemukan di cabang aktif.",
                    "warning"
                );
                return;
            }

            if (foundTrainer.status !== "inactive") {
                showFeedback(
                    "Trainer Masih Aktif",
                    "Trainer harus dinonaktifkan sebelum dihapus.",
                    "warning"
                );
                return;
            }

            // Periksa semua tabel yang menyimpan interaksi trainer
            const checks = [
                {
                    table: "trainer_members",
                    label: "data anggota yang ditangani",
                },
                {
                    table: "trainer_packages",
                    label: "data paket trainer",
                },
                {
                    table: "trainer_package_members",
                    label: "data pembelian paket",
                },
                {
                    table: "trainer_sessions",
                    label: "riwayat sesi latihan",
                },
            ] as const;

            for (const check of checks) {
                const { count, error } = await supabase
                    .from(check.table)
                    .select("id", { count: "exact", head: true })
                    .eq("trainer_id", trainer.id);

                if (error) throw error;

                if ((count ?? 0) > 0) {
                    showFeedback(
                        "Trainer Tidak Dapat Dihapus",
                        `Trainer masih memiliki ${check.label}. Data tersebut harus dipertahankan.`,
                        "warning"
                    );
                    return;
                }
            }

            // Tampilkan modal konfirmasi sebelum menghapus
            askConfirmation(
                "Hapus Trainer?",
                `Yakin ingin menghapus trainer "${foundTrainer.name}" secara permanen? Tindakan ini tidak dapat dibatalkan.`,
                async () => {
                    setSaving(true);

                    try {
                        const { data, error } = await supabase
                            .from("trainers")
                            .delete()
                            .eq("id", trainer.id)
                            .eq("branch_id", branchId)
                            .eq("status", "inactive")
                            .select("id");

                        if (error) throw error;

                        if (!data || data.length === 0) {
                            showFeedback(
                                "Penghapusan Gagal",
                                "Trainer tidak terhapus. Periksa izin database dan status trainer.",
                                "error"
                            );
                            return;
                        }

                        showFeedback(
                            "Berhasil",
                            "Trainer berhasil dihapus.",
                            "success"
                        );

                        // Tunggu sebentar agar pesan berhasil terlihat
                        window.setTimeout(() => {
                            window.location.href = "/trainers";
                        }, 1200);
                    } catch (error) {
                        console.error("Gagal menghapus trainer:", error);

                        showFeedback(
                            "Penghapusan Gagal",
                            "Trainer gagal dihapus. Periksa relasi data dan izin database.",
                            "error"
                        );
                    } finally {
                        setSaving(false);
                    }
                }
            );
        } catch (error) {
            console.error("Gagal memeriksa trainer:", error);

            showFeedback(
                "Terjadi Kesalahan",
                "Gagal memeriksa data trainer. Silakan coba lagi.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    }


    /* =========================
       CATAT SESI
    ========================= */

    const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);

    const [sessionPackageMemberId, setSessionPackageMemberId] = useState("");
    const [sessionDate, setSessionDate] = useState("");
    const [sessionNotes, setSessionNotes] = useState("");

    const [sessionPaymentMethod, setSessionPaymentMethod] =
        useState("cash");


    const [sessionVisitorName, setSessionVisitorName] = useState("");

    const [savingSession, setSavingSession] = useState(false);

    const [sessionType, setSessionType] = useState<
        "package" | "single"
    >("package");

    /* =========================
       BELI PAKET
    ========================= */

    const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);

    const [purchaseMemberId, setPurchaseMemberId] = useState("");
    const [purchasePackageId, setPurchasePackageId] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [purchasePaymentMethod, setPurchasePaymentMethod] = useState("");
    const [purchaseNotes, setPurchaseNotes] = useState("");

    const [savingPurchase, setSavingPurchase] = useState(false);

    /* =========================
       LOAD TRAINER
    ========================= */

    useEffect(() => {
        async function loadTrainer() {
            const { id } = await params;

            const supabase = createClient();
            const branchId = getActiveBranchId();

            if (!branchId) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("trainers")
                .select(
                    "id, name, phone, specialization, price_per_session, status"
                )
                .eq("id", id)
                .eq("branch_id", branchId)
                .single();

            if (error) {
                console.error("Gagal mengambil trainer:", error);
                setLoading(false);
                return;
            }

            setTrainer(data);

            await loadPackages(id);
            await loadSessionMembers(id);
            await loadAvailableMembers(id);
            await loadPackageMembers(id);
            await loadSessions(id);

            setLoading(false);
        }

        loadTrainer();
    }, [params]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                <p>Memuat data trainer...</p>
            </main>
        );
    }

    if (!trainer) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                <p>Trainer tidak ditemukan.</p>
            </main>
        );
    }

    /* =========================
       EDIT TRAINER
    ========================= */

    function startEditing() {
        if (!trainer) return;

        setName(trainer.name);
        setPhone(trainer.phone);
        setSpecialization(trainer.specialization);
        setPricePerSession(String(trainer.price_per_session));

        setIsEditing(true);
    }

    /* =========================
       LOAD PACKAGES
    ========================= */

    async function loadPackages(trainerId: string) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from("trainer_packages")
            .select("id, name, session_count, price, status")
            .eq("trainer_id", trainerId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(
                "Gagal mengambil paket trainer:",
                error
            );
            return;
        }

        setPackages(data ?? []);
    }

    /* =========================
       LOAD MEMBER TRAINER
    ========================= */

    async function loadSessionMembers(trainerId: string) {
        const supabase = createClient();

        const { data: relations, error: relationError } =
            await supabase
                .from("trainer_members")
                .select("member_id, created_at")
                .eq("trainer_id", trainerId)
                .order("created_at", { ascending: false });

        if (relationError) {
            console.error(
                "Gagal mengambil member trainer:",
                relationError
            );
            return;
        }

        const memberIds = (relations ?? []).map(
            (item) => item.member_id
        );

        if (memberIds.length === 0) {
            setMembers([]);
            return;
        }

        const { data: memberData, error: memberError } =
            await supabase
                .from("members")
                .select("id, name")
                .in("id", memberIds)

        if (memberError) {
            console.error(
                "Gagal mengambil data member:",
                memberError
            );
            return;
        }

        const {
            data: activePackages,
            error: packageError,
        } = await supabase
            .from("trainer_package_members")
            .select("member_id, remaining_sessions")
            .eq("trainer_id", trainerId)
            .eq("status", "active")
            .gt("remaining_sessions", 0)
            .in("member_id", memberIds);

        if (packageError) {
            console.error(
                "Gagal mengambil paket aktif member:",
                packageError
            );
            return;
        }

        const activePackageMap = new Map(
            (activePackages ?? []).map((item) => [
                item.member_id,
                item.remaining_sessions,
            ])
        );

        const membersWithPackage = (memberData ?? []).map(
            (member) => {
                const remainingSessions =
                    activePackageMap.get(member.id) ?? 0;

                return {
                    id: member.id,
                    name: member.name,
                    remaining_sessions: remainingSessions,
                    has_active_package:
                        remainingSessions > 0,
                };
            }
        );

        setMembers(membersWithPackage);
    }

    /* =========================
       LOAD AVAILABLE MEMBER
    ========================= */

    async function loadAvailableMembers(trainerId: string) {
        const supabase = createClient();
        const branchId = getActiveBranchId();

        if (!branchId) {
            setAvailableMembers([]);
            return;
        }

        const { data: allMembers, error: memberError } =
            await supabase
                .from("members")
                .select("id, name")
                .eq("branch_id", branchId)
                .order("name");

        if (memberError) {
            console.error(
                "Gagal mengambil daftar member:",
                memberError
            );
            return;
        }

        const { data: relations, error: relationError } =
            await supabase
                .from("trainer_members")
                .select("member_id")
                .eq("trainer_id", trainerId);

        if (relationError) {
            console.error(
                "Gagal mengambil hubungan member trainer:",
                relationError
            );
            return;
        }

        const assignedMemberIds = new Set(
            (relations ?? []).map(
                (item) => item.member_id
            )
        );

        setAvailableMembers(
            (allMembers ?? []).filter(
                (member) =>
                    !assignedMemberIds.has(member.id)
            )
        );
    }

    /* =========================
   TAMBAH MEMBER TRAINER
========================= */

    async function addTrainerMember(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!selectedMemberId) {
            showFeedback(
                "Member Belum Dipilih",
                "Pilih member terlebih dahulu.",
                "warning"
            );
            return;
        }

        const trainerId = trainer?.id;

        if (!trainerId) {
            showFeedback(
                "Data Trainer Belum Tersedia",
                "Data trainer belum tersedia. Silakan coba lagi.",
                "warning"
            );
            return;
        }

        setSavingMember(true);

        try {
            const supabase = createClient();

            const { error } = await supabase
                .from("trainer_members")
                .insert({
                    trainer_id: trainerId,
                    member_id: selectedMemberId,
                    start_date: new Date()
                        .toISOString()
                        .split("T")[0],
                });

            if (error) {
                console.error(
                    "Gagal menambahkan member:",
                    error
                );

                showFeedback(
                    "Gagal Menambahkan Member",
                    `Member gagal ditambahkan: ${error.message}`,
                    "error"
                );
                return;
            }

            setSelectedMemberId("");
            setIsMemberFormOpen(false);

            await loadSessionMembers(trainerId);
            await loadAvailableMembers(trainerId);

            showFeedback(
                "Berhasil",
                "Member berhasil ditambahkan ke trainer.",
                "success"
            );
        } catch (error) {
            console.error(
                "Terjadi kesalahan saat menambahkan member:",
                error
            );

            showFeedback(
                "Terjadi Kesalahan",
                "Member gagal ditambahkan. Silakan coba lagi.",
                "error"
            );
        } finally {
            setSavingMember(false);
        }
    }
    /* =========================
        HAPUS MEMBER TRAINER
    ========================= */

    async function removeTrainerMember(memberId: string) {
        const trainerId = trainer?.id;

        if (!trainerId) {
            showFeedback(
                "Data Tidak Tersedia",
                "Data trainer belum tersedia.",
                "warning"
            );
            return;
        }

        askConfirmation(
            "Hapus Member dari Trainer?",
            "Yakin ingin menghapus member ini dari daftar trainer?",
            async () => {
                const supabase = createClient();

                try {
                    const {
                        data: activePackage,
                        error: packageError,
                    } = await supabase
                        .from("trainer_package_members")
                        .select("id")
                        .eq("trainer_id", trainerId)
                        .eq("member_id", memberId)
                        .eq("status", "active")
                        .gt("remaining_sessions", 0)
                        .limit(1)
                        .maybeSingle();

                    if (packageError) {
                        console.error(
                            "Gagal mengecek paket trainer member:",
                            packageError
                        );

                        showFeedback(
                            "Gagal Memeriksa Paket",
                            packageError.message,
                            "error"
                        );
                        return;
                    }

                    if (activePackage) {
                        showFeedback(
                            "Member Tidak Dapat Dihapus",
                            "Member masih memiliki paket PT aktif dengan sisa sesi. Member belum dapat dihapus dari trainer.",
                            "warning"
                        );
                        return;
                    }

                    const { error } = await supabase
                        .from("trainer_members")
                        .delete()
                        .eq("trainer_id", trainerId)
                        .eq("member_id", memberId);

                    if (error) {
                        console.error(
                            "Gagal menghapus member dari trainer:",
                            error
                        );

                        showFeedback(
                            "Gagal Menghapus Member",
                            error.message,
                            "error"
                        );
                        return;
                    }

                    await loadSessionMembers(trainerId);
                    await loadAvailableMembers(trainerId);

                    showFeedback(
                        "Berhasil",
                        "Member berhasil dihapus dari daftar trainer.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "Terjadi kesalahan saat menghapus member:",
                        error
                    );

                    showFeedback(
                        "Terjadi Kesalahan",
                        "Member gagal dihapus. Silakan coba lagi.",
                        "error"
                    );
                }
            }
        );
    }

    /* =========================
       LOAD PAKET MEMBER
    ========================= */

    async function loadPackageMembers(
        trainerId: string
    ) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from("trainer_package_members")
            .select(`
                id,
                member_id,
                trainer_package_id,
                total_sessions,
                remaining_sessions,
                purchase_date,
                status,
                members(name),
                trainer_packages(name)
            `)
            .eq("trainer_id", trainerId)
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error(
                "Gagal mengambil paket member:",
                error
            );
            return;
        }

        const formattedData = (data ?? []).map(
            (item: any) => ({
                id: item.id,
                member_id: item.member_id,
                trainer_package_id:
                    item.trainer_package_id,
                total_sessions:
                    item.total_sessions,
                remaining_sessions:
                    item.remaining_sessions,
                purchase_date:
                    item.purchase_date,
                status: item.status,
                member_name:
                    item.members?.name ?? "-",
                package_name:
                    item.trainer_packages?.name ?? "-",
            })
        );

        setPackageMembers(formattedData);
    }

    /* =========================
       LOAD SESI
    ========================= */

    async function loadSessions(trainerId: string) {
        const supabase = createClient();

        const searchTerm = sessionSearch
            .trim()
            .toLowerCase();

        let matchingMemberIds: string[] = [];

        if (searchTerm) {
            const {
                data: matchingMembers,
                error: memberSearchError,
            } = await supabase
                .from("members")
                .select("id")
                .ilike(
                    "name",
                    `%${searchTerm}%`
                );

            if (memberSearchError) {
                console.error(
                    "Gagal mencari member:",
                    memberSearchError
                );
                return;
            }

            matchingMemberIds = (
                matchingMembers ?? []
            ).map((member) => member.id);
        }

        let query = supabase
            .from("trainer_sessions")
            .select(`
                id,
                member_id,
                visitor_name,
                session_date,
                price,
                payment_method,
                notes,
                created_at,
                trainer_package_member_id
            `)
            .eq("trainer_id", trainerId)
            .order("session_date", {
                ascending: false,
            })
            .order("created_at", {
                ascending: false,
            });

        if (sessionStartDate) {
            query = query.gte(
                "session_date",
                sessionStartDate
            );
        }

        if (sessionEndDate) {
            query = query.lte(
                "session_date",
                sessionEndDate
            );
        }

        const hasDateFilter =
            Boolean(sessionStartDate) ||
            Boolean(sessionEndDate);

        if (searchTerm) {
            const safeSearch = searchTerm
                .replace(/[,%()]/g, " ")
                .trim();

            if (matchingMemberIds.length > 0) {
                query = query.or(
                    `visitor_name.ilike.%${safeSearch}%,member_id.in.(${matchingMemberIds.join(
                        ","
                    )})`
                );
            } else {
                query = query.ilike(
                    "visitor_name",
                    `%${safeSearch}%`
                );
            }
        }

        if (!hasDateFilter) {
            query = query.limit(20);
        }

        const { data, error } = await query;

        if (error) {
            console.error(
                "Gagal mengambil riwayat sesi:",
                error
            );
            return;
        }

        const memberIds = (data ?? [])
            .map((item) => item.member_id)
            .filter(
                (id): id is string => Boolean(id)
            );

        let memberMap = new Map<string, string>();

        if (memberIds.length > 0) {
            const {
                data: memberData,
                error: memberError,
            } = await supabase
                .from("members")
                .select("id, name")
                .in("id", memberIds);

            if (memberError) {
                console.error(
                    "Gagal mengambil nama member:",
                    memberError
                );
                return;
            }

            memberMap = new Map(
                (memberData ?? []).map(
                    (member) => [
                        member.id,
                        member.name,
                    ]
                )
            );
        }

        const formattedSessions = (
            data ?? []
        ).map((item) => ({
            id: item.id,

            member_name: item.member_id
                ? memberMap.get(
                    item.member_id
                ) ?? "-"
                : item.visitor_name ?? "-",

            session_date: item.session_date,
            notes: item.notes,

            price: Number(item.price ?? 0),

            payment_method:
                item.payment_method,

            session_type:
                item.trainer_package_member_id
                    ? ("package" as const)
                    : ("single" as const),
        }));

        setSessions(formattedSessions);
    }

    /* =========================
   TAMBAH PAKET TRAINER
========================= */

    async function addPackage(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!packageName.trim()) {
            showFeedback(
                "Nama Paket Belum Diisi",
                "Nama paket harus diisi.",
                "warning"
            );
            return;
        }

        if (Number(packageSessionCount) <= 0) {
            showFeedback(
                "Jumlah Sesi Tidak Valid",
                "Jumlah sesi harus lebih dari 0.",
                "warning"
            );
            return;
        }

        if (Number(packagePrice) < 0) {
            showFeedback(
                "Harga Tidak Valid",
                "Harga tidak boleh kurang dari 0.",
                "warning"
            );
            return;
        }

        setSavingPackage(true);

        try {
            const { id } = await params;
            const supabase = createClient();

            const { error } = await supabase
                .from("trainer_packages")
                .insert({
                    trainer_id: id,
                    name: packageName.trim(),
                    session_count: Number(packageSessionCount),
                    price: Number(packagePrice),
                    status: "active",
                });

            if (error) {
                console.error(
                    "Gagal menambahkan paket:",
                    error
                );

                showFeedback(
                    "Gagal Menambahkan Paket",
                    `Paket gagal ditambahkan: ${error.message}`,
                    "error"
                );
                return;
            }

            setPackageName("");
            setPackageSessionCount("");
            setPackagePrice("");
            setIsPackageFormOpen(false);

            await loadPackages(id);
            setPackagePage(1);

            showFeedback(
                "Berhasil",
                "Paket trainer berhasil ditambahkan.",
                "success"
            );
        } catch (error) {
            console.error(
                "Terjadi kesalahan saat menambahkan paket:",
                error
            );

            showFeedback(
                "Terjadi Kesalahan",
                "Paket gagal ditambahkan. Silakan coba lagi.",
                "error"
            );
        } finally {
            setSavingPackage(false);
        }
    }

    /* =========================
       EDIT PAKET
    ========================= */

    function startEditPackage(
        item: TrainerPackage
    ) {
        setEditingPackageId(item.id);
        setPackageName(item.name);
        setPackageSessionCount(
            String(item.session_count)
        );
        setPackagePrice(String(item.price));
        setIsPackageFormOpen(true);
    }

    async function updatePackage(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!editingPackageId) return;

        if (!packageName.trim()) {
            alert("Nama paket harus diisi.");
            return;
        }

        if (Number(packageSessionCount) <= 0) {
            alert(
                "Jumlah sesi harus lebih dari 0."
            );
            return;
        }

        if (Number(packagePrice) < 0) {
            alert(
                "Harga tidak boleh kurang dari 0."
            );
            return;
        }

        setSavingPackage(true);

        const supabase = createClient();

        const { error } = await supabase
            .from("trainer_packages")
            .update({
                name: packageName.trim(),
                session_count:
                    Number(packageSessionCount),
                price: Number(packagePrice),
            })
            .eq("id", editingPackageId);

        if (error) {
            console.error(
                "Gagal mengubah paket:",
                error
            );

            alert(
                "Gagal mengubah paket: " +
                error.message
            );

            setSavingPackage(false);
            return;
        }

        const { id } = await params;

        await loadPackages(id);

        setEditingPackageId(null);
        setPackageName("");
        setPackageSessionCount("");
        setPackagePrice("");
        setIsPackageFormOpen(false);
        setSavingPackage(false);

        alert(
            "Paket berhasil diperbarui."
        );
    }

    /* =========================
        NONAKTIFKAN PAKET
    ========================= */

    async function deactivatePackage(packageId: string) {
        askConfirmation(
            "Nonaktifkan Paket?",
            "Yakin ingin menonaktifkan paket ini?",
            async () => {
                const supabase = createClient();

                try {
                    const { error } = await supabase
                        .from("trainer_packages")
                        .update({
                            status: "inactive",
                        })
                        .eq("id", packageId);

                    if (error) {
                        console.error(
                            "Gagal menonaktifkan paket:",
                            error
                        );

                        showFeedback(
                            "Gagal Menonaktifkan Paket",
                            `Gagal menonaktifkan paket: ${error.message}`,
                            "error"
                        );
                        return;
                    }

                    const { id } = await params;

                    await loadPackages(id);

                    showFeedback(
                        "Berhasil",
                        "Paket berhasil dinonaktifkan.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "Terjadi kesalahan saat menonaktifkan paket:",
                        error
                    );

                    showFeedback(
                        "Terjadi Kesalahan",
                        "Paket gagal dinonaktifkan. Silakan coba lagi.",
                        "error"
                    );
                }
            }
        );
    }

    /* =========================
        HAPUS PAKET TRAINER
    ========================= */

    async function deletePackage(packageId: string) {
        const supabase = createClient();

        try {
            // Periksa paket yang akan dihapus
            const { data: selectedPackage, error: packageError } =
                await supabase
                    .from("trainer_packages")
                    .select("id, name, status")
                    .eq("id", packageId)
                    .maybeSingle();

            if (packageError) throw packageError;

            if (!selectedPackage) {
                showFeedback(
                    "Paket Tidak Ditemukan",
                    "Paket yang ingin dihapus tidak ditemukan.",
                    "warning"
                );
                return;
            }

            if (selectedPackage.status !== "inactive") {
                showFeedback(
                    "Paket Masih Aktif",
                    "Nonaktifkan paket terlebih dahulu sebelum menghapusnya.",
                    "warning"
                );
                return;
            }

            // Periksa riwayat pembelian paket
            const { count, error: historyError } = await supabase
                .from("trainer_package_members")
                .select("id", { count: "exact", head: true })
                .eq("trainer_package_id", packageId);

            if (historyError) throw historyError;

            if ((count ?? 0) > 0) {
                showFeedback(
                    "Paket Tidak Dapat Dihapus",
                    "Paket ini memiliki riwayat pembelian. Riwayat harus dipertahankan, sehingga paket tidak dapat dihapus.",
                    "warning"
                );
                return;
            }

            // Minta konfirmasi sebelum menghapus
            askConfirmation(
                "Hapus Paket?",
                `Yakin ingin menghapus paket "${selectedPackage.name}" secara permanen? Tindakan ini tidak dapat dibatalkan.`,
                async () => {
                    try {
                        const { error } = await supabase
                            .from("trainer_packages")
                            .delete()
                            .eq("id", packageId)
                            .eq("status", "inactive");

                        if (error) throw error;

                        const { id } = await params;
                        await loadPackages(id);

                        showFeedback(
                            "Berhasil",
                            "Paket berhasil dihapus.",
                            "success"
                        );
                    } catch (error) {
                        console.error(
                            "Gagal menghapus paket:",
                            error
                        );

                        showFeedback(
                            "Gagal Menghapus Paket",
                            "Paket gagal dihapus. Periksa relasi data dan izin database.",
                            "error"
                        );
                    }
                }
            );
        } catch (error) {
            console.error(
                "Gagal memeriksa paket sebelum dihapus:",
                error
            );

            showFeedback(
                "Terjadi Kesalahan",
                "Gagal memeriksa data paket. Silakan coba lagi.",
                "error"
            );
        }
    }

    /* =========================
        AKTIFKAN PAKET
    ========================= */

    async function activatePackage(packageId: string) {
        askConfirmation(
            "Aktifkan Kembali Paket?",
            "Yakin ingin mengaktifkan kembali paket ini?",
            async () => {
                const supabase = createClient();

                try {
                    const { error } = await supabase
                        .from("trainer_packages")
                        .update({
                            status: "active",
                        })
                        .eq("id", packageId);

                    if (error) {
                        console.error(
                            "Gagal mengaktifkan paket:",
                            error
                        );

                        showFeedback(
                            "Gagal Mengaktifkan Paket",
                            `Paket gagal diaktifkan: ${error.message}`,
                            "error"
                        );
                        return;
                    }

                    const { id } = await params;

                    await loadPackages(id);

                    showFeedback(
                        "Berhasil",
                        "Paket berhasil diaktifkan kembali.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "Terjadi kesalahan saat mengaktifkan paket:",
                        error
                    );

                    showFeedback(
                        "Terjadi Kesalahan",
                        "Paket gagal diaktifkan. Silakan coba lagi.",
                        "error"
                    );
                }
            }
        );
    }

    /* =========================
        UPDATE TRAINER
    ========================= */

    async function updateTrainer(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!trainer) return;

        setSaving(true);

        try {
            const supabase = createClient();
            const branchId = getActiveBranchId();

            if (!branchId) {
                showFeedback(
                    "Cabang Belum Dipilih",
                    "Cabang aktif belum dipilih.",
                    "warning"
                );
                return;
            }

            const { error } = await supabase
                .from("trainers")
                .update({
                    name,
                    phone,
                    specialization,
                    price_per_session: Number(pricePerSession),
                })
                .eq("id", trainer.id)
                .eq("branch_id", branchId);

            if (error) {
                console.error(
                    "Gagal mengubah trainer:",
                    error
                );

                showFeedback(
                    "Gagal Memperbarui Trainer",
                    `Data trainer gagal diperbarui: ${error.message}`,
                    "error"
                );
                return;
            }

            setTrainer({
                ...trainer,
                name,
                phone,
                specialization,
                price_per_session: Number(pricePerSession),
            });

            setIsEditing(false);

            showFeedback(
                "Berhasil",
                "Data trainer berhasil diperbarui.",
                "success"
            );
        } catch (error) {
            console.error(
                "Terjadi kesalahan saat memperbarui trainer:",
                error
            );

            showFeedback(
                "Terjadi Kesalahan",
                "Data trainer gagal diperbarui. Silakan coba lagi.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    }
    /* =========================
   NONAKTIFKAN TRAINER
========================= */

    async function deactivateTrainer() {
        if (!trainer) return;

        askConfirmation(
            "Nonaktifkan Trainer?",
            "Yakin ingin menonaktifkan trainer ini?",
            async () => {
                const supabase = createClient();
                const branchId = getActiveBranchId();

                if (!branchId) {
                    showFeedback(
                        "Cabang Belum Dipilih",
                        "Cabang aktif belum dipilih.",
                        "warning"
                    );
                    return;
                }

                try {
                    const { error } = await supabase
                        .from("trainers")
                        .update({
                            status: "inactive",
                        })
                        .eq("id", trainer.id)
                        .eq("branch_id", branchId);

                    if (error) {
                        console.error(
                            "Gagal menonaktifkan trainer:",
                            error
                        );

                        showFeedback(
                            "Gagal Menonaktifkan Trainer",
                            `Trainer gagal dinonaktifkan: ${error.message}`,
                            "error"
                        );
                        return;
                    }

                    setTrainer({
                        ...trainer,
                        status: "inactive",
                    });

                    showFeedback(
                        "Berhasil",
                        "Trainer berhasil dinonaktifkan.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "Terjadi kesalahan saat menonaktifkan trainer:",
                        error
                    );

                    showFeedback(
                        "Terjadi Kesalahan",
                        "Trainer gagal dinonaktifkan. Silakan coba lagi.",
                        "error"
                    );
                }
            }
        );
    }

    /* =========================
        AKTIFKAN TRAINER
    ========================= */

    async function activateTrainer() {
        if (!trainer) return;

        askConfirmation(
            "Aktifkan Kembali Trainer?",
            "Yakin ingin mengaktifkan kembali trainer ini?",
            async () => {
                const supabase = createClient();
                const branchId = getActiveBranchId();

                if (!branchId) {
                    showFeedback(
                        "Cabang Belum Dipilih",
                        "Cabang aktif belum dipilih.",
                        "warning"
                    );
                    return;
                }

                try {
                    const { error } = await supabase
                        .from("trainers")
                        .update({
                            status: "active",
                        })
                        .eq("id", trainer.id)
                        .eq("branch_id", branchId);

                    if (error) {
                        console.error(
                            "Gagal mengaktifkan trainer:",
                            error
                        );

                        showFeedback(
                            "Gagal Mengaktifkan Trainer",
                            `Trainer gagal diaktifkan: ${error.message}`,
                            "error"
                        );
                        return;
                    }

                    setTrainer({
                        ...trainer,
                        status: "active",
                    });

                    showFeedback(
                        "Berhasil",
                        "Trainer berhasil diaktifkan kembali.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "Terjadi kesalahan saat mengaktifkan trainer:",
                        error
                    );

                    showFeedback(
                        "Terjadi Kesalahan",
                        "Trainer gagal diaktifkan. Silakan coba lagi.",
                        "error"
                    );
                }
            }
        );
    }

    /* =========================
        CATAT SESI
    ========================= */

    async function addSession(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!sessionDate) {
            showFeedback(
                "Tanggal Belum Diisi",
                "Tanggal sesi harus diisi.",
                "warning"
            );
            return;
        }

        if (
            sessionType === "package" &&
            !sessionPackageMemberId
        ) {
            showFeedback(
                "Paket Member Belum Dipilih",
                "Pilih paket member yang akan digunakan.",
                "warning"
            );
            return;
        }

        if (
            sessionType === "single" &&
            !sessionVisitorName.trim()
        ) {
            showFeedback(
                "Nama Pelanggan Belum Diisi",
                "Nama pelanggan harus diisi.",
                "warning"
            );
            return;
        }

        setSavingSession(true);

        try {
            const supabase = createClient();
            const { id } = await params;

            let error;

            if (sessionType === "package") {
                const result = await supabase.rpc(
                    "use_trainer_session",
                    {
                        p_trainer_package_member_id:
                            sessionPackageMemberId,
                        p_session_date: sessionDate,
                        p_notes: sessionNotes,
                    }
                );

                error = result.error;
            } else {
                const result = await supabase.rpc(
                    "create_trainer_single_session",
                    {
                        p_trainer_id: id,
                        p_member_id: null,
                        p_visitor_name: sessionVisitorName.trim(),
                        p_session_date: sessionDate,
                        p_payment_method: sessionPaymentMethod,
                        p_notes: sessionNotes,
                    }
                );

                error = result.error;
            }

            if (error) {
                console.error(
                    "Gagal mencatat sesi:",
                    error
                );

                showFeedback(
                    "Gagal Mencatat Sesi",
                    `Sesi gagal dicatat: ${error.message}`,
                    "error"
                );
                return;
            }

            await loadPackageMembers(id);
            await loadSessions(id);
            await loadSessionMembers(id);

            setSessionType("package");
            setSessionPackageMemberId("");
            setSessionPaymentMethod("cash");
            setSessionDate("");
            setSessionNotes("");
            setSessionVisitorName("");

            setIsSessionFormOpen(false);

            showFeedback(
                "Berhasil",
                sessionType === "package"
                    ? "Sesi berhasil dicatat menggunakan paket member."
                    : "Sesi berhasil dicatat dengan pembayaran per sesi.",
                "success"
            );
        } catch (error) {
            console.error(
                "Terjadi kesalahan saat mencatat sesi:",
                error
            );

            showFeedback(
                "Terjadi Kesalahan",
                "Sesi gagal dicatat. Silakan coba lagi.",
                "error"
            );
        } finally {
            setSavingSession(false);
        }
    }


    /* =========================
        BELI PAKET
    ========================= */

    async function purchasePackage(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!purchaseMemberId || !purchasePackageId) {
            showFeedback(
                "Data Belum Lengkap",
                "Member dan paket harus dipilih.",
                "warning"
            );
            return;
        }

        setSavingPurchase(true);

        try {
            const supabase = createClient();

            const { error } = await supabase.rpc(
                "purchase_trainer_package",
                {
                    p_trainer_package_id: purchasePackageId,
                    p_member_id: purchaseMemberId,
                    p_payment_method: purchasePaymentMethod,
                    p_purchase_date: purchaseDate,
                    p_notes: purchaseNotes,
                }
            );

            if (error) {
                console.error(
                    "Gagal membeli paket:",
                    error
                );

                showFeedback(
                    "Gagal Membeli Paket",
                    `Pembelian paket gagal: ${error.message}`,
                    "error"
                );
                return;
            }

            const { id } = await params;

            await loadPackageMembers(id);
            await loadSessionMembers(id);

            setPurchaseMemberId("");
            setPurchasePackageId("");
            setPurchaseDate("");
            setPurchasePaymentMethod("");
            setPurchaseNotes("");
            setIsPurchaseFormOpen(false);

            showFeedback(
                "Pembelian Berhasil",
                "Paket berhasil dibeli dan ditambahkan ke riwayat paket member.",
                "success"
            );
        } catch (error) {
            console.error(
                "Terjadi kesalahan saat membeli paket:",
                error
            );

            showFeedback(
                "Terjadi Kesalahan",
                "Pembelian paket gagal diproses. Silakan coba lagi.",
                "error"
            );
        } finally {
            setSavingPurchase(false);
        }
    }

    /* =========================
        BATALKAN PAKET MEMBER
    ========================= */

    async function cancelPackageMember(
        packageMemberId: string
    ) {
        askConfirmation(
            "Batalkan Paket Member?",
            "Batalkan paket member ini? Paket yang sudah digunakan tidak dapat dibatalkan.",
            async () => {
                const supabase = createClient();

                try {
                    const { error } = await supabase.rpc(
                        "cancel_trainer_package_member",
                        {
                            p_trainer_package_member_id:
                                packageMemberId,
                        }
                    );

                    if (error) {
                        console.error(
                            "Gagal membatalkan paket:",
                            error
                        );

                        showFeedback(
                            "Gagal Membatalkan Paket",
                            `Paket gagal dibatalkan: ${error.message}`,
                            "error"
                        );
                        return;
                    }

                    if (trainer) {
                        await loadPackageMembers(trainer.id);
                        await loadSessionMembers(trainer.id);
                    }

                    showFeedback(
                        "Berhasil",
                        "Paket member berhasil dibatalkan.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "Terjadi kesalahan saat membatalkan paket:",
                        error
                    );

                    showFeedback(
                        "Terjadi Kesalahan",
                        "Paket member gagal dibatalkan. Silakan coba lagi.",
                        "error"
                    );
                }
            }
        );
    }

    return (
        <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 sm:p-8">

            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                    <span aria-hidden="true">←</span>
                    Kembali
                </button>
            </div>


            {/* =========================
                PROFIL TRAINER
            ========================= */}
            <TrainerProfileSection
                trainer={trainer}
                saving={saving}
                isEditing={isEditing}
                name={name}
                phone={phone}
                specialization={specialization}
                onStartEditing={startEditing}
                onActivate={activateTrainer}
                onDeactivate={deactivateTrainer}
                onDelete={deleteTrainer}
                onNameChange={setName}
                onPhoneChange={setPhone}
                onSpecializationChange={setSpecialization}
                pricePerSession={pricePerSession}
                onPricePerSessionChange={setPricePerSession}
                onSubmit={updateTrainer}
                onCloseEdit={() => setIsEditing(false)}
            />


            {/* MEMBER YANG DITANGANI */}

            <TrainerMembersSection
                members={members}
                filteredMembers={filteredMembers}
                paginatedMembers={paginatedMembers}
                availableMembers={availableMembers}
                memberSearch={memberSearch}
                memberFilter={memberFilter}
                memberPage={memberPage}
                memberTotalPages={memberTotalPages}
                membersPerPage={membersPerPage}
                trainerStatus={trainer.status}
                isMemberFormOpen={isMemberFormOpen}
                selectedMemberId={selectedMemberId}
                savingMember={savingMember}
                onSearchChange={(value) => {
                    setMemberSearch(value);
                    setMemberPage(1);
                }}
                onFilterChange={(value) => {
                    setMemberFilter(value);
                    setMemberPage(1);
                }}
                onPageChange={setMemberPage}
                onOpenForm={() => {
                    setSelectedMemberId("");
                    setIsMemberFormOpen(true);

                    if (trainer) {
                        loadAvailableMembers(trainer.id);
                    }
                }}
                onMemberChange={setSelectedMemberId}
                onSubmit={addTrainerMember}
                onCloseForm={() => setIsMemberFormOpen(false)}
                onRemoveMember={removeTrainerMember}
            />


            {/* PAKET SESI */}

            <TrainerPackagesSection
                packages={packages}
                paginatedPackages={paginatedPackages}
                trainerStatus={trainer.status}
                packageSearch={packageSearch}
                packageFilter={packageFilter}
                packagePage={packagePage}
                packageTotalPages={packageTotalPages}
                packagesPerPage={packagesPerPage}
                isPackageFormOpen={isPackageFormOpen}
                editingPackageId={editingPackageId}
                packageName={packageName}
                packageSessionCount={packageSessionCount}
                packagePrice={packagePrice}
                savingPackage={savingPackage}
                onSearchChange={(value: string) => {
                    setPackageSearch(value);
                    setPackagePage(1);
                }}
                onFilterChange={(value: "all" | "active" | "inactive") => {
                    setPackageFilter(value);
                    setPackagePage(1);
                }}
                onPageChange={setPackagePage}
                onOpenForm={() => {
                    setEditingPackageId(null);
                    setPackageName("");
                    setPackageSessionCount("");
                    setPackagePrice("");
                    setIsPackageFormOpen(true);
                }}
                onPackageNameChange={setPackageName}
                onPackageSessionCountChange={setPackageSessionCount}
                onPackagePriceChange={setPackagePrice}
                onSubmit={editingPackageId ? updatePackage : addPackage}
                onCloseForm={() => setIsPackageFormOpen(false)}
                onEdit={startEditPackage}
                onDeactivate={deactivatePackage}
                onActivate={activatePackage}
                onDelete={deletePackage}
            />


            {/* SESI TRAINER */}

            <TrainerSessionsSection
                sessions={sessions}
                filteredSessions={filteredSessions}
                paginatedSessions={paginatedSessions}
                sessionSearch={sessionSearch}
                sessionTypeFilter={sessionTypeFilter}
                sessionPaymentFilter={sessionPaymentFilter}
                sessionStartDate={sessionStartDate}
                sessionEndDate={sessionEndDate}
                sessionPage={sessionPage}
                sessionTotalPages={sessionTotalPages}
                sessionsPerPage={sessionsPerPage}

                onOpenForm={() => {
                    setSessionType("package");
                    setSessionPackageMemberId("");
                    setSessionVisitorName("");
                    setSessionPaymentMethod("cash");
                    setSessionDate(new Date().toISOString().split("T")[0]);
                    setSessionNotes("");
                    setIsSessionFormOpen(true);
                }}


                onSearchChange={(value: string) => {
                    setSessionSearch(value);
                    setSessionPage(1);
                }}
                onTypeFilterChange={(value: "all" | "package" | "single") => {
                    setSessionTypeFilter(value);
                    setSessionPage(1);
                }}
                onPaymentFilterChange={(
                    value: "all" | "cash" | "qris" | "transfer"
                ) => {
                    setSessionPaymentFilter(value);
                    setSessionPage(1);
                }}
                onStartDateChange={(value: string) => {
                    setSessionStartDate(value);
                    setSessionPage(1);
                }}
                onEndDateChange={(value: string) => {
                    setSessionEndDate(value);
                    setSessionPage(1);
                }}
                onReset={() => {
                    setSessionSearch("");
                    setSessionTypeFilter("all");
                    setSessionPaymentFilter("all");
                    setSessionStartDate("");
                    setSessionEndDate("");
                    setSessionPage(1);
                }}
                onPageChange={setSessionPage}
            />


            {/* =========================
                MODAL CATAT SESI
            ========================= */}

            {isSessionFormOpen && (
                <TrainerSessionModal
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
                    savingSession={savingSession}
                    onSessionTypeChange={setSessionType}
                    onPackageMemberChange={
                        setSessionPackageMemberId
                    }
                    onDateChange={setSessionDate}
                    onNotesChange={setSessionNotes}
                    onPaymentMethodChange={
                        setSessionPaymentMethod
                    }
                    onVisitorNameChange={
                        setSessionVisitorName
                    }
                    onSubmit={addSession}
                    onClose={() =>
                        setIsSessionFormOpen(false)
                    }
                />
            )}



            {/* PAKET MEMBER */}

            <TrainerPackageMembersSection
                trainer={trainer}
                members={members}
                packages={packages}
                packageMembers={packageMembers}
                filteredPackageMembers={filteredPackageMembers}
                paginatedPackageMembers={paginatedPackageMembers}
                packageMemberSearch={packageMemberSearch}
                packageMemberFilter={packageMemberFilter}
                packageMemberPage={packageMemberPage}
                packageMemberTotalPages={packageMemberTotalPages}
                packageMembersPerPage={packageMembersPerPage}
                isPurchaseFormOpen={isPurchaseFormOpen}
                purchaseMemberId={purchaseMemberId}
                purchasePackageId={purchasePackageId}
                purchaseDate={purchaseDate}
                purchasePaymentMethod={purchasePaymentMethod}
                purchaseNotes={purchaseNotes}
                savingPurchase={savingPurchase}
                onSearchChange={(value: string) => {
                    setPackageMemberSearch(value);
                    setPackageMemberPage(1);
                }}
                onFilterChange={(value: "all" | "active" | "history") => {
                    setPackageMemberFilter(value);
                    setPackageMemberPage(1);
                }}
                onPageChange={setPackageMemberPage}
                onOpenForm={() => {
                    setPurchaseMemberId("");
                    setPurchasePackageId("");
                    setPurchaseDate(new Date().toISOString().split("T")[0]);
                    setPurchasePaymentMethod("");
                    setPurchaseNotes("");
                    setIsPurchaseFormOpen(true);
                }}
                onMemberChange={setPurchaseMemberId}
                onPackageChange={setPurchasePackageId}
                onDateChange={setPurchaseDate}
                onPaymentMethodChange={setPurchasePaymentMethod}
                onNotesChange={setPurchaseNotes}
                onSubmit={purchasePackage}
                onCloseForm={() => setIsPurchaseFormOpen(false)}
                onCancelPackage={cancelPackageMember}
            />


            <FeedbackModal
                open={feedback.open}
                title={feedback.title}
                message={feedback.message}
                type={feedback.type}
                onClose={() =>
                    setFeedback((prev) => ({ ...prev, open: false }))
                }
            />

            {confirmation.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="confirmation-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <h2
                            id="confirmation-title"
                            className="text-lg font-bold text-zinc-900"
                        >
                            {confirmation.title}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                            {confirmation.message}
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setConfirmation({
                                        open: false,
                                        title: "",
                                        message: "",
                                        onConfirm: null,
                                    })
                                }
                                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    const action = confirmation.onConfirm;

                                    setConfirmation({
                                        open: false,
                                        title: "",
                                        message: "",
                                        onConfirm: null,
                                    });

                                    if (action) await action();
                                }}
                                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                            >
                                Ya, lanjutkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}