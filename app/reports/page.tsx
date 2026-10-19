"use client";

import SummaryReport from "@/components/reports/SummaryReport";
import MembersReport from "@/components/reports/MembersReport";
import MembershipReport from "@/components/reports/MembershipReport";
import VisitsReport from "@/components/reports/VisitsReport";
import TrainersReport from "@/components/reports/TrainersReport";
import TransactionReport from "@/components/reports/TransactionReport";
import ProductReport from "@/components/reports/ProductReport";
import {
  CalendarDays,
  Check,
  ClipboardList,
  FileBarChart,
  FileSpreadsheet,
  ListChecks,
  SquareMinus,
  Users,
  CreditCard,
  CalendarCheck,
  Dumbbell,
  Receipt,
  Package,
  ChartNoAxesCombined,
} from "lucide-react";


import * as XLSX from "xlsx";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";


const reportOptions = [
  { id: "summary", label: "Ringkasan", icon: ChartNoAxesCombined },
  { id: "members", label: "Data Member", icon: Users },
  { id: "membership", label: "Membership", icon: CreditCard },
  { id: "visits", label: "Kunjungan", icon: CalendarCheck },
  { id: "trainers", label: "Trainer", icon: Dumbbell },
  { id: "transactions", label: "Transaksi", icon: Receipt },
  { id: "products", label: "Produk & Stok", icon: Package },
];


export default function ReportsPage() {
  const [selectedReports, setSelectedReports] = useState<string[]>(
    reportOptions.map((report) => report.id)
  );

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [message, setMessage] = useState("");

  const [summary, setSummary] = useState({
    newMembers: 0,
    totalVisits: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  });


  const [memberReport, setMemberReport] = useState<
    {
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
      gender: string | null;
      address: string | null;
      membership: string | null;
      created_at: string;
    }[]
  >([]);


  const [visitReport, setVisitReport] = useState<
    {
      id: string;
      memberName: string;
      visitDate: string;
      visitFee: number;
      paymentMethod: string | null;
      isMember: boolean;
    }[]
  >([]);

  const [membershipReport, setMembershipReport] = useState<
    {
      id: string;
      memberName: string;
      planName: string;
      startDate: string;
      endDate: string;
      status: string;
    }[]
  >([]);

  const [trainerReport, setTrainerReport] = useState<
    {
      id: string;
      name: string;
      memberCount: number;
      sessionCount: number;
      revenue: number;
    }[]
  >([]);

  const [transactionReport, setTransactionReport] = useState<
    {
      id: string;
      transactionDate: string;
      transactionType: string;
      memberName: string;
      paymentMethod: string;
      totalAmount: number;
      status: string;
      notes: string | null;
    }[]
  >([]);

  const [productReport, setProductReport] = useState<
    {
      id: string;
      name: string;
      category: string;
      price: number;
      openingStock: number | null;
      stockIn: number;
      stockOut: number;
      endingStock: number | null;
      historyComplete: boolean;
    }[]
  >([]);

  const [showReport, setShowReport] = useState(false);

  function toggleReport(id: string) {
    setSelectedReports((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAllReports() {
    if (selectedReports.length === reportOptions.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reportOptions.map((report) => report.id));
    }
  }

  async function loadSummary() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMessage("Cabang aktif belum dipilih.");
      return;
    }

    const { count: newMembers, error: memberError } = await supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

    if (memberError) {
      console.error("Gagal mengambil data member.");
      setMessage("Gagal mengambil data member.");
      return;
    }

    const { count: newMemberships, error: membershipError } = await supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

    if (membershipError) {
      console.error("Gagal mengambil data membership.");
      setMessage("Gagal mengambil data membership.");
      return;
    }

    const { count: totalVisits, error: visitError } = await supabase
      .from("visits")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", branchId)
      .gte("visit_date", startDate)
      .lte("visit_date", endDate);

    if (visitError) {
      console.error("Gagal mengambil data kunjungan.");
      setMessage("Gagal mengambil data kunjungan.");
      return;
    }

    const { data: transactions, error: transactionError } = await supabase
      .from("transactions")
      .select("id, total_amount")
      .eq("branch_id", branchId)
      .gte("transaction_date", `${startDate}T00:00:00`)
      .lte("transaction_date", `${endDate}T23:59:59`)
      .eq("status", "completed");

    if (transactionError) {
      console.error("Gagal mengambil data transaksi.");
      setMessage("Gagal mengambil data transaksi.");
      return;
    }

    const totalRevenue = (transactions ?? []).reduce(
      (total, transaction) => total + Number(transaction.total_amount ?? 0),
      0
    );

    setSummary({
      newMembers: newMembers ?? 0,
      totalVisits: totalVisits ?? 0,
      totalTransactions: transactions?.length ?? 0,
      totalRevenue,
    });

    setMessage("Laporan berhasil diperbarui.");
  }

  async function loadMemberReport() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMessage("Cabang aktif belum dipilih.");
      return;
    }


    const { data, error } = await supabase
      .from("members")
      .select(`
        id,
        name,
        phone,
        email,
        gender,
        address,
        membership,
        created_at
      `)
      .eq("branch_id", branchId)
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`)
      .order("created_at", { ascending: false });


    if (error) {
      console.error("Gagal memuat laporan member.");

      setMessage(
        `Gagal mengambil data member: ${error.message || "Penyebab tidak diketahui."}`
      );

      return;
    }

    setMemberReport(data ?? []);
  }

  async function handleShowReport() {
    setMessage("");

    if (!startDate || !endDate) {
      setMessage("Silakan pilih tanggal mulai dan tanggal akhir.");
      return;
    }

    if (startDate > endDate) {
      setMessage("Tanggal mulai tidak boleh lebih besar dari tanggal akhir.");
      return;
    }

    if (selectedReports.length === 0) {
      setMessage("Pilih minimal satu jenis laporan.");
      return;
    }

    setShowReport(true);

    if (selectedReports.includes("summary")) {
      await loadSummary();
    }

    if (selectedReports.includes("members")) {
      await loadMemberReport();
    }

    if (selectedReports.includes("membership")) {
      await loadMembershipReport();
    }

    if (selectedReports.includes("visits")) {
      await loadVisitReport();
    }

    if (selectedReports.includes("trainers")) {
      await loadTrainerReport();
    }

    if (selectedReports.includes("transactions")) {
      await loadTransactionReport();
    }

    if (selectedReports.includes("products")) {
      await loadProductReport();
    }
  }

  function handleExportXlsx() {
    if (!showReport) {
      setMessage("Tampilkan laporan terlebih dahulu sebelum export.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    if (selectedReports.includes("summary")) {
      const summaryData = [
        ["Laporan", "Nilai"],
        ["Member Baru", summary.newMembers],
        ["Total Kunjungan", summary.totalVisits],
        ["Total Transaksi", summary.totalTransactions],
        ["Total Pendapatan", summary.totalRevenue],
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(summaryData);

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Ringkasan"
      );
    }

    if (selectedReports.includes("members")) {
      const memberData = memberReport.map((member, index) => ({
        No: index + 1,
        Nama: member.name,
        Telepon: member.phone ?? "-",
        Email: member.email ?? "-",
        Gender: member.gender ?? "-",
        Alamat: member.address ?? "-",
        Status: member.membership ?? "-",
        "Tanggal Daftar": member.created_at,
      }));

      const worksheet = XLSX.utils.json_to_sheet(memberData);

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Data Member"
      );
    }

    if (selectedReports.includes("membership")) {
      const membershipData = membershipReport.map(
        (membership, index) => ({
          No: index + 1,
          Member: membership.memberName,
          Paket: membership.planName,
          "Tanggal Mulai": membership.startDate,
          "Tanggal Selesai": membership.endDate,
          Status: membership.status,
        })
      );

      const worksheet =
        XLSX.utils.json_to_sheet(membershipData);

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Data Membership"
      );
    }

    if (selectedReports.includes("visits")) {
      const visitData = visitReport.map((visit, index) => ({
        No: index + 1,
        "Member / Pengunjung": visit.memberName,
        "Tanggal Kunjungan": visit.visitDate,
        Biaya: visit.visitFee,
        Pembayaran: visit.paymentMethod ?? "-",
        Jenis: visit.isMember ? "Member" : "Non-member",
      }));

      const worksheet = XLSX.utils.json_to_sheet(visitData);

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Data Kunjungan"
      );
    }

    if (selectedReports.includes("trainers")) {
      const trainerData = trainerReport.map(
        (trainer, index) => ({
          No: index + 1,
          Trainer: trainer.name,
          "Jumlah Member": trainer.memberCount,
          "Jumlah Sesi": trainer.sessionCount,
          Pendapatan: trainer.revenue,
        })
      );

      const worksheet =
        XLSX.utils.json_to_sheet(trainerData);

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Data Trainer"
      );
    }

    if (selectedReports.includes("transactions")) {
      const transactionData = transactionReport.map(
        (transaction, index) => ({
          No: index + 1,
          Tanggal: transaction.transactionDate,
          Tipe: transaction.transactionType,
          Member: transaction.memberName,
          Pembayaran: transaction.paymentMethod,
          Total: transaction.totalAmount,
          Status: transaction.status,
          Catatan: transaction.notes ?? "-",
        })
      );

      const worksheet =
        XLSX.utils.json_to_sheet(transactionData);

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Data Transaksi"
      );
    }

    if (selectedReports.includes("products")) {
      const productData = productReport.map((product, index) => ({
        No: index + 1,
        Produk: product.name,
        Kategori: product.category || "-",
        Harga: product.price,
        "Stok Awal": product.openingStock ?? "Riwayat belum lengkap",
        "Stok Masuk": product.stockIn,
        "Stok Keluar": product.stockOut,
        "Stok Akhir": product.endingStock ?? "Riwayat belum lengkap",
      }));

      const worksheet = XLSX.utils.json_to_sheet(productData);

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Produk & Stok"
      );
    }

    if (workbook.SheetNames.length === 0) {
      setMessage("Tidak ada laporan yang dapat diexport.");
      return;
    }

    const fileName =
      `Laporan_GymDesk_${startDate}_${endDate}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    setMessage("Laporan berhasil diexport ke Excel.");
  }

  async function loadMembershipReport() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMessage("Cabang aktif belum dipilih.");
      return;
    }

    const { data: memberships, error: membershipError } = await supabase
      .from("memberships")
      .select(`
      id,
      member_id,
      plan_id,
      start_date,
      end_date,
      status
    `)
      .eq("branch_id", branchId)
      .lte("start_date", endDate)
      .gte("end_date", startDate)
      .order("start_date", { ascending: false });

    if (membershipError) {
      console.error("Gagal mengambil data membership.");
      setMessage("Gagal mengambil data membership.");
      return;
    }

    const memberIds = [
      ...new Set(
        (memberships ?? []).map((membership) => membership.member_id)
      ),
    ];

    const planIds = [
      ...new Set(
        (memberships ?? []).map((membership) => membership.plan_id)
      ),
    ];

    const { data: members, error: memberError } = await supabase
      .from("members")
      .select("id, name")
      .eq("branch_id", branchId)
      .in("id", memberIds);

    if (memberError) {
      console.error("Gagal mengambil data member.");
      setMessage("Gagal mengambil data member membership.");
      return;
    }

    const { data: plans, error: planError } = await supabase
      .from("membership_plans")
      .select("id, name, price")
      .eq("branch_id", branchId)
      .in("id", planIds);

    if (planError) {
      console.error("Gagal mengambil paket membership.");
      setMessage("Gagal mengambil data paket membership.");
      return;
    }

    const memberMap = new Map(
      (members ?? []).map((member) => [member.id, member.name])
    );

    const planMap = new Map(
      (plans ?? []).map((plan) => [
        plan.id,
        {
          name: plan.name,
          price: Number(plan.price ?? 0),
        },
      ])
    );

    setMembershipReport(
      (memberships ?? []).map((membership) => {
        const plan = planMap.get(membership.plan_id);

        return {
          id: membership.id,
          memberName:
            memberMap.get(membership.member_id) ?? "Member tidak ditemukan",
          planName: plan?.name ?? "Paket tidak ditemukan",
          startDate: membership.start_date,
          endDate: membership.end_date,
          status: membership.status,
        };
      })
    );
  }

  async function loadVisitReport() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMessage("Cabang aktif belum dipilih.");
      return;
    }

    const { data: visits, error: visitError } = await supabase
      .from("visits")
      .select(`
      id,
      member_id,
      visitor_name,
      visit_date,
      visit_fee,
      payment_method
    `)
      .eq("branch_id", branchId)
      .gte("visit_date", startDate)
      .lte("visit_date", endDate)
      .order("visit_date", { ascending: false });

    if (visitError) {
      console.error("Gagal mengambil data kunjungan.");
      setMessage("Gagal mengambil data kunjungan.");
      return;
    }

    const memberIds = [
      ...new Set(
        (visits ?? [])
          .map((visit) => visit.member_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    let members: { id: string; name: string }[] = [];

    if (memberIds.length > 0) {
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("id, name")
        .eq("branch_id", branchId)
        .in("id", memberIds);

      if (memberError) {
        console.error("Gagal mengambil data member.");
        setMessage("Gagal mengambil data member kunjungan.");
        return;
      }

      members = memberData ?? [];
    }

    const memberMap = new Map(
      members.map((member) => [member.id, member.name])
    );

    setVisitReport(
      (visits ?? []).map((visit) => ({
        id: visit.id,
        memberName: visit.member_id
          ? memberMap.get(visit.member_id) ?? "Member tidak ditemukan"
          : visit.visitor_name ?? "Pengunjung",
        visitDate: visit.visit_date,
        visitFee: Number(visit.visit_fee ?? 0),
        paymentMethod: visit.payment_method,
        isMember: Boolean(visit.member_id),
      }))
    );
  }

  async function loadTrainerReport() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMessage("Cabang aktif belum dipilih.");
      return;
    }

    // Ambil trainer pada cabang aktif
    const { data: trainers, error: trainerError } = await supabase
      .from("trainers")
      .select("id, name")
      .eq("branch_id", branchId)
      .order("name", { ascending: true });

    if (trainerError) {
      console.error("Gagal mengambil data trainer.");
      setMessage("Gagal mengambil data trainer.");
      return;
    }

    if (!trainers || trainers.length === 0) {
      setTrainerReport([]);
      return;
    }

    const trainerIds = trainers.map((trainer) => trainer.id);

    // Ambil hubungan trainer dengan member
    const { data: trainerMembers, error: trainerMemberError } =
      await supabase
        .from("trainer_members")
        .select("trainer_id, member_id")
        .in("trainer_id", trainerIds);

    if (trainerMemberError) {
      console.error("Gagal mengambil data member trainer.");
      setMessage("Gagal mengambil data member trainer.");
      return;
    }

    // Ambil sesi trainer pada periode laporan
    const { data: sessions, error: sessionError } = await supabase
      .from("trainer_sessions")
      .select("trainer_id")
      .in("trainer_id", trainerIds)
      .gte("session_date", startDate)
      .lte("session_date", endDate)
      .eq("status", "completed");

    if (sessionError) {
      console.error("Gagal mengambil data sesi trainer.");
      setMessage("Gagal mengambil data sesi trainer.");
      return;
    }

    // Ambil transaksi dari pembelian paket trainer
    const { data: packageMembers, error: packageMemberError } =
      await supabase
        .from("trainer_package_members")
        .select(`
      trainer_id,
      transaction_id
    `)
        .in("trainer_id", trainerIds)
        .gte("purchase_date", startDate)
        .lte("purchase_date", endDate);

    if (packageMemberError) {
      console.error("Gagal mengambil data paket trainer.");
      setMessage("Gagal mengambil data paket trainer.");
      return;
    }

    // Ambil sesi trainer per sesi pada periode laporan
    const { data: singleSessions, error: singleSessionError } =
      await supabase
        .from("trainer_sessions")
        .select(`
      trainer_id,
      transaction_id
    `)
        .in("trainer_id", trainerIds)
        .gte("session_date", startDate)
        .lte("session_date", endDate)
        .eq("status", "completed");

    if (singleSessionError) {
      console.error("Gagal mengambil data sesi satuan.");
      setMessage("Gagal mengambil transaksi sesi trainer.");
      return;
    }

    // Gabungkan semua transaction_id dari:
    // 1. pembelian paket trainer
    // 2. pembayaran PT per sesi
    const transactionIds = [
      ...new Set([
        ...(packageMembers ?? [])
          .map((item) => item.transaction_id)
          .filter((id): id is string => Boolean(id)),

        ...(singleSessions ?? [])
          .map((item) => item.transaction_id)
          .filter((id): id is string => Boolean(id)),
      ]),
    ];

    let transactions: {
      id: string;
      total_amount: number | null;
    }[] = [];

    if (transactionIds.length > 0) {
      const { data: transactionData, error: transactionError } =
        await supabase
          .from("transactions")
          .select("id, total_amount")
          .in("id", transactionIds)
          .eq("status", "completed");

      if (transactionError) {
        console.error("Gagal mengambil data transaksi.");
        setMessage("Gagal mengambil transaksi trainer.");
        return;
      }

      transactions = transactionData ?? [];
    }
    // Buat map jumlah member per trainer
    const memberCountMap = new Map<string, number>();

    for (const item of trainerMembers ?? []) {
      memberCountMap.set(
        item.trainer_id,
        (memberCountMap.get(item.trainer_id) ?? 0) + 1
      );
    }

    // Buat map jumlah sesi per trainer
    const sessionCountMap = new Map<string, number>();

    for (const session of sessions ?? []) {
      sessionCountMap.set(
        session.trainer_id,
        (sessionCountMap.get(session.trainer_id) ?? 0) + 1
      );
    }

    // Buat map transaksi berdasarkan ID
    const transactionMap = new Map(
      transactions.map((transaction) => [
        transaction.id,
        Number(transaction.total_amount ?? 0),
      ])
    );

    // Hitung pendapatan masing-masing trainer
    const revenueMap = new Map<string, number>();

    // Pendapatan dari pembelian paket trainer
    for (const packageMember of packageMembers ?? []) {
      if (!packageMember.transaction_id) {
        continue;
      }

      const amount =
        transactionMap.get(packageMember.transaction_id) ?? 0;

      revenueMap.set(
        packageMember.trainer_id,
        (revenueMap.get(packageMember.trainer_id) ?? 0) + amount
      );
    }

    // Pendapatan dari PT per sesi
    for (const session of singleSessions ?? []) {
      if (!session.transaction_id) {
        continue;
      }

      const amount =
        transactionMap.get(session.transaction_id) ?? 0;

      revenueMap.set(
        session.trainer_id,
        (revenueMap.get(session.trainer_id) ?? 0) + amount
      );
    }

    setTrainerReport(
      trainers.map((trainer) => ({
        id: trainer.id,
        name: trainer.name,
        memberCount: memberCountMap.get(trainer.id) ?? 0,
        sessionCount: sessionCountMap.get(trainer.id) ?? 0,
        revenue: revenueMap.get(trainer.id) ?? 0,
      }))
    );
  }


  async function loadTransactionReport() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMessage("Cabang aktif belum dipilih.");
      return;
    }

    // Ambil transaksi beserta member_id secara langsung
    const { data, error } = await supabase
      .from("transactions")
      .select(`
            id,
            transaction_date,
            transaction_type,
            member_id,
            payment_method,
            total_amount,
            status,
            notes,
            customer_name
        `)
      .eq("branch_id", branchId)
      .gte(
        "transaction_date",
        `${startDate}T00:00:00`
      )
      .lte(
        "transaction_date",
        `${endDate}T23:59:59`
      )
      .order("transaction_date", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Gagal mengambil data transaksi:",
        error
      );
      setMessage("Gagal mengambil data transaksi.");
      return;
    }

    // Kumpulkan ID member yang ada di transaksi
    const memberIds = [
      ...new Set(
        (data ?? [])
          .map((transaction) => transaction.member_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    // Ambil nama member langsung dari tabel members
    const { data: members, error: memberError } =
      memberIds.length > 0
        ? await supabase
          .from("members")
          .select("id, name")
          .in("id", memberIds)
          .eq("branch_id", branchId)
        : { data: [], error: null };

    if (memberError) {
      console.error(
        "Gagal mengambil nama member:",
        memberError
      );
      setMessage("Gagal mengambil nama member.");
      return;
    }

    // Pasangkan ID member dengan namanya
    const memberNameMap = new Map(
      (members ?? []).map((member) => [
        member.id,
        member.name,
      ])
    );

    const formattedTransactions = (data ?? []).map(
      (transaction) => ({
        id: transaction.id,
        transactionDate: transaction.transaction_date,
        transactionType: transaction.transaction_type,
        memberName:
          (transaction.member_id
            ? memberNameMap.get(transaction.member_id)
            : null) ??
          transaction.customer_name ??
          "Non-member",
        paymentMethod: transaction.payment_method,
        totalAmount: Number(
          transaction.total_amount ?? 0
        ),
        status: transaction.status,
        notes: transaction.notes,
      })
    );

    setTransactionReport(formattedTransactions);
  }


  async function loadProductReport() {
    const supabase = createClient();
    const branchId = getActiveBranchId();

    if (!branchId) {
      setMessage("Cabang aktif belum dipilih.");
      return;
    }

    // Pastikan tanggal laporan sudah dipilih.
    if (!startDate || !endDate) {
      setMessage("Silakan pilih tanggal mulai dan tanggal akhir.");
      return;
    }

    // 1. Ambil semua produk dari cabang aktif.
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, name, category, price, stock")
      .eq("branch_id", branchId)
      .order("name", { ascending: true });

    if (productError) {
      console.error("Gagal mengambil data produk.");
      setMessage("Gagal mengambil data produk.");
      return;
    }

    const productIds = (products ?? []).map((product) => product.id);

    if (productIds.length === 0) {
      setProductReport([]);
      setMessage("Tidak ada produk pada cabang ini.");
      return;
    }

    // 2. Ambil riwayat pergerakan stok, termasuk sebelum periode.
    const { data: movements, error: movementError } = await supabase
      .from("stock_movements")
      .select("product_id, type, quantity, description, created_at")
      .eq("branch_id", branchId)
      .in("product_id", productIds)
      .order("created_at", { ascending: true });

    if (movementError) {
      console.error("Gagal mengambil data pergerakan stok.");
      setMessage("Gagal mengambil data pergerakan stok.");
      return;
    }

    // Gunakan batas waktu WIB (UTC+7).
    // Tanggal akhir menggunakan batas eksklusif hari berikutnya.
    const startTime = new Date(
      `${startDate}T00:00:00+07:00`
    ).getTime();

    const endExclusiveTime =
      new Date(`${endDate}T00:00:00+07:00`).getTime() +
      24 * 60 * 60 * 1000;

    // 3. Hitung laporan masing-masing produk.
    const report = (products ?? []).map((product) => {
      const productMovements = (movements ?? []).filter(
        (movement) => movement.product_id === product.id
      );

      // Catatan stok awal yang dibuat oleh form tambah produk.
      const initialMovement = productMovements.find(
        (movement) =>
          movement.type === "in" &&
          movement.description === "Stok awal produk"
      );

      let stockIn = 0;
      let stockOut = 0;

      // Hitung pergerakan stok yang terjadi di dalam periode.
      for (const movement of productMovements) {
        const movementTime = new Date(movement.created_at).getTime();

        if (
          movementTime < startTime ||
          movementTime >= endExclusiveTime
        ) {
          continue;
        }

        const quantity = Number(movement.quantity ?? 0);

        if (movement.type === "in") {
          stockIn += quantity;
        } else if (movement.type === "out") {
          stockOut += quantity;
        }
      }

      // Produk lama tanpa catatan stok awal tidak dapat
      // dipastikan stok historisnya hanya dari riwayat yang tersedia.
      if (!initialMovement) {
        return {
          id: product.id,
          name: product.name,
          category: product.category ?? "",
          price: Number(product.price ?? 0),
          openingStock: null,
          stockIn,
          stockOut,
          endingStock: null,
          historyComplete: false,
        };
      }

      const initialTime = new Date(
        initialMovement.created_at
      ).getTime();

      let openingStock = Number(initialMovement.quantity ?? 0);
      let hasEarlierAdjustment = false;
      let hasPeriodAdjustment = false;

      // Hitung stok sebelum tanggal mulai.
      for (const movement of productMovements) {
        const movementTime = new Date(movement.created_at).getTime();

        // Jangan hitung catatan yang mendahului catatan stok awal.
        if (movementTime <= initialTime || movementTime >= startTime) {
          continue;
        }

        const quantity = Number(movement.quantity ?? 0);

        if (movement.type === "in") {
          openingStock += quantity;
        } else if (movement.type === "out") {
          openingStock -= quantity;
        } else if (movement.type === "adjustment") {
          hasEarlierAdjustment = true;
        }
      }

      // Periksa apakah ada adjustment di periode laporan.
      for (const movement of productMovements) {
        const movementTime = new Date(movement.created_at).getTime();

        if (
          movementTime >= startTime &&
          movementTime < endExclusiveTime &&
          movement.type === "adjustment"
        ) {
          hasPeriodAdjustment = true;
        }
      }

      // Adjustment belum dihitung karena perlu memastikan
      // apakah quantity merupakan nilai perubahan atau stok hasil penyesuaian.
      const validOpeningStock =
        !hasEarlierAdjustment &&
        Number.isFinite(openingStock);

      const endingStock =
        validOpeningStock && !hasPeriodAdjustment
          ? openingStock + stockIn - stockOut
          : null;

      return {
        id: product.id,
        name: product.name,
        category: product.category ?? "",
        price: Number(product.price ?? 0),
        openingStock: validOpeningStock ? openingStock : null,
        stockIn,
        stockOut,
        endingStock,
        historyComplete:
          validOpeningStock &&
          !hasPeriodAdjustment,
      };
    });

    // 4. Kirim hasil ke komponen laporan.
    setProductReport(report);
    setMessage("Laporan berhasil diperbarui.");
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <FileBarChart size={26} />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Laporan
          </h1>

          <p className="mt-1 text-sm text-zinc-500 sm:text-base">
            Kelola, tampilkan, dan export laporan GymDesk berdasarkan periode.
          </p>
        </div>
      </div>

      {/* FILTER PERIODE */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3 border-b border-zinc-200 pb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <CalendarDays size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              Periode Laporan
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Tentukan rentang tanggal data yang ingin dianalisis.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="report-start-date"
              className="mb-2 block text-sm font-semibold text-zinc-700"
            >
              Tanggal Mulai
            </label>

            <input
              id="report-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="report-end-date"
              className="mb-2 block text-sm font-semibold text-zinc-700"
            >
              Tanggal Akhir
            </label>

            <input
              id="report-end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>
      </section>

      {/* PILIHAN LAPORAN */}
      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
              <ClipboardList size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                Pilih Laporan
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Pilih satu atau beberapa jenis laporan yang ingin ditampilkan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleAllReports}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50 sm:self-auto"
          >
            {selectedReports.length === reportOptions.length ? (
              <SquareMinus size={17} />
            ) : (
              <ListChecks size={17} />
            )}

            {selectedReports.length === reportOptions.length
              ? "Batalkan Semua"
              : "Pilih Semua"}
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {reportOptions.map((report) => {
            const checked = selectedReports.includes(report.id);


            return (
              <label
                key={report.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${checked
                  ? "border-orange-400 bg-orange-50 shadow-sm"
                  : "border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleReport(report.id)}
                  className="h-4 w-4 shrink-0 accent-orange-500"
                />

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${checked
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-100 text-zinc-600"
                    }`}
                >
                  <report.icon size={20} />
                </div>

                <span
                  className={`text-sm font-semibold ${checked ? "text-zinc-900" : "text-zinc-700"
                    }`}
                >
                  {report.label}
                </span>

                {checked && (
                  <Check
                    size={18}
                    className="ml-auto shrink-0 text-orange-600"
                  />
                )}
              </label>
            );
          })}
        </div>

        <div className="mt-4 text-sm text-zinc-500">
          {selectedReports.length} dari {reportOptions.length} laporan dipilih
        </div>
      </section>

      {/* TOMBOL AKSI */}
      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              Hasil Laporan
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Tampilkan laporan atau simpan data yang dipilih ke Excel.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleShowReport}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <FileBarChart size={17} />
              Tampilkan Laporan
            </button>

            <button
              type="button"
              onClick={handleExportXlsx}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2"
            >
              <FileSpreadsheet size={17} />
              Export XLSX
            </button>
          </div>
        </div>
      </section>

      {/* HASIL LAPORAN */}
      {selectedReports.includes("summary") && showReport && (
        <SummaryReport
          newMembers={summary.newMembers}
          totalVisits={summary.totalVisits}
          totalTransactions={summary.totalTransactions}
          totalRevenue={summary.totalRevenue}
        />
      )}

      {selectedReports.includes("members") && showReport && (
        <MembersReport members={memberReport} />
      )}

      {selectedReports.includes("membership") && showReport && (
        <MembershipReport memberships={membershipReport} />
      )}

      {selectedReports.includes("visits") && showReport && (
        <VisitsReport visits={visitReport} />
      )}

      {selectedReports.includes("trainers") && showReport && (
        <TrainersReport trainers={trainerReport} />
      )}

      {selectedReports.includes("transactions") && showReport && (
        <TransactionReport transactions={transactionReport} />
      )}

      {selectedReports.includes("products") && showReport && (
        <ProductReport products={productReport} />
      )}

      {/* PESAN */}
      {message && (
        <div
          role="status"
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${message.includes("Gagal") ||
            message.includes("tidak boleh") ||
            message.includes("Silakan") ||
            message.includes("Pilih minimal") ||
            message.includes("belum dipilih") ||
            message.includes("Tidak ada")
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-green-200 bg-green-50 text-green-700"
            }`}
        >
          {message}
        </div>
      )}
    </main>
  );
}