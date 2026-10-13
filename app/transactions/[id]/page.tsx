"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  FileText,
  Package,
  ReceiptText,
  Tag,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type Transaction = {
  id: string;
  membership_id: string | null;
  transaction_type: string;
  payment_method: string;
  total_amount: number;
  status: string;
  transaction_date: string;
  notes: string | null;
  customer_name: string | null;
  members: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
};

type Membership = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  membership_plans: {
    name: string;
    duration: number;
    price: number;
  }[] | null;
};

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [transaction, setTransaction] =
    useState<Transaction | null>(null);
  const [membership, setMembership] =
    useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTransaction() {
      try {
        const { id } = await params;
        const supabase = createClient();
        const branchId = getActiveBranchId();

        if (!branchId) return;

        const { data, error } = await supabase
          .from("transactions")
          .select(`
            id,
            membership_id,
            transaction_type,
            payment_method,
            total_amount,
            status,
            transaction_date,
            notes,
            customer_name,
            members!transactions_member_id_fkey (
              id,
              name,
              phone
            )
          `)
          .eq("id", id)
          .eq("branch_id", branchId)
          .single();

        if (error) throw error;

        const memberData = data.members;
        const member = Array.isArray(memberData)
          ? memberData[0] ?? null
          : memberData ?? null;

        setTransaction({
          ...data,
          members: member,
        });

        // Ambil membership yang terhubung langsung
        // dengan transaksi ini.
        if (
          data.transaction_type === "membership" &&
          data.membership_id
        ) {
          const { data: membershipData, error: membershipError } =
            await supabase
              .from("memberships")
              .select(`
                id,
                start_date,
                end_date,
                status,
                membership_plans (
                  name,
                  duration,
                  price
                )
              `)
              .eq("id", data.membership_id)
              .eq("branch_id", branchId)
              .maybeSingle();

          if (membershipError) throw membershipError;

          setMembership(membershipData);
        }
      } catch (error) {
        console.error("Gagal mengambil detail transaksi:", error);
      } finally {
        setLoading(false);
      }
    }

    getTransaction();
  }, [params]);

  function formatType(type: string) {
    const types: Record<string, string> = {
      registration: "Pendaftaran",
      membership: "Membership",
      product: "Produk",
      trainer_package: "Paket Trainer",
      trainer: "Sesi Personal Trainer",
    };

    return types[type] ?? "Lainnya";
  }

  function formatPaymentMethod(method: string) {
    const methods: Record<string, string> = {
      cash: "Tunai",
      qris: "QRIS",
      transfer: "Transfer Bank",
    };

    return methods[method] ?? method;
  }

  function formatStatus(status: string) {
    const statuses: Record<string, string> = {
      completed: "Selesai",
      pending: "Menunggu",
      cancelled: "Dibatalkan",
      active: "Aktif",
      expired: "Berakhir",
    };

    return statuses[status] ?? status;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDateOnly(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "id-ID",
      {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    );
  }

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  }

  function statusStyle(status: string) {
    switch (status) {
      case "completed":
      case "active":
        return "bg-green-50 text-green-700";

      case "pending":
        return "bg-amber-50 text-amber-700";

      case "cancelled":
      case "expired":
        return "bg-red-50 text-red-700";

      default:
        return "bg-zinc-100 text-zinc-600";
    }
  }

  if (loading) {
    return (
      <main className="p-6 text-base text-zinc-500">
        Memuat transaksi...
      </main>
    );
  }

  if (!transaction) {
    return (
      <main className="p-6">
        <p className="text-base text-red-600">
          Transaksi tidak ditemukan atau tidak dapat diakses.
        </p>
        <Link
          href="/transactions"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600"
        >
          <ArrowLeft size={18} />
          Kembali ke transaksi
        </Link>
      </main>
    );
  }

  const plan = Array.isArray(membership?.membership_plans)
    ? membership.membership_plans[0]
    : membership?.membership_plans;

  const customerName =
    transaction.members?.name ??
    transaction.customer_name ??
    "Tidak diketahui";

  return (
    <main className="min-h-screen bg-zinc-50 p-4 text-zinc-900 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Judul Halaman */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <ReceiptText size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Detail Transaksi
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Informasi lengkap transaksi pembayaran.
            </p>
          </div>
        </div>

        {/* Tombol Kembali di Sebelah Kanan */}
        <Link
          href="/transactions"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>
      </div>

      {/* Ringkasan dan Informasi Transaksi */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
        {/* Total dan Status */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Total Pembayaran
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              {formatRupiah(transaction.total_amount)}
            </h2>
          </div>

          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${transaction.status === "completed"
              ? "border-green-200 bg-green-50 text-green-700"
              : transaction.status === "pending"
                ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                : transaction.status === "cancelled"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-zinc-200 bg-zinc-100 text-zinc-600"
              }`}
          >
            {formatStatus(transaction.status)}
          </span>
        </div>

        {/* Keterangan Status */}
        <div className="mt-4 flex items-center gap-2 border-b border-zinc-200 pb-4 text-sm text-zinc-600">
          {transaction.status === "completed" ? (
            <CheckCircle2 size={18} className="shrink-0 text-green-600" />
          ) : (
            <CircleAlert size={18} className="shrink-0 text-zinc-500" />
          )}

          <span>
            {transaction.status === "completed"
              ? "Transaksi telah selesai diproses."
              : `Status transaksi: ${formatStatus(transaction.status)}.`}
          </span>
        </div>

        {/* Informasi Transaksi */}
        <h2 className="mb-4 mt-5 text-lg font-bold">
          Informasi Transaksi
        </h2>

        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <InfoItem
            icon={<ReceiptText size={20} />}
            label="Jenis Transaksi"
            value={formatType(transaction.transaction_type)}
          />

          <InfoItem
            icon={<CalendarClock size={20} />}
            label="Tanggal Transaksi"
            value={formatDate(transaction.transaction_date)}
          />

          <InfoItem
            icon={<CreditCard size={20} />}
            label="Metode Pembayaran"
            value={formatPaymentMethod(transaction.payment_method)}
          />

          <InfoItem
            icon={<UserRound size={20} />}
            label="Nama Pelanggan"
            value={customerName}
          />

          <InfoItem
            icon={<Tag size={20} />}
            label="Jenis Pelanggan"
            value={transaction.members ? "Member" : "Non-member"}
          />

          {transaction.members?.phone && (
            <InfoItem
              icon={<UserRound size={20} />}
              label="Nomor Telepon"
              value={transaction.members.phone}
            />
          )}

          <InfoItem
            icon={<FileText size={20} />}
            label="ID Transaksi"
            value={transaction.id}
            mono
          />
        </div>

        {/* Catatan */}
        {transaction.notes && (
          <div className="mt-5 border-t border-zinc-100 pt-4">
            <p className="text-sm font-semibold text-zinc-600">
              Catatan
            </p>
            <p className="mt-1 text-base text-zinc-800 whitespace-pre-wrap">
              {transaction.notes}
            </p>
          </div>
        )}
      </section>

      {/* Detail Membership */}
      {transaction.transaction_type === "membership" && (
        <section className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
          {membership ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Package size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">
                      Detail Membership
                    </h2>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      Paket yang terkait dengan transaksi ini
                    </p>
                  </div>
                </div>

                {/* Status Transaksi */}
                <span
                  className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${transaction.status === "completed"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : transaction.status === "pending"
                      ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                      : transaction.status === "cancelled"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-zinc-200 bg-zinc-100 text-zinc-600"
                    }`}
                >
                  {formatStatus(transaction.status)}
                </span>
              </div>

              {/* Garis Pemisah Header */}
              <div className="mt-5 border-t border-zinc-200" />

              {/* Informasi Membership */}
              <div className="mt-5 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
                <InfoItem
                  icon={<Package size={20} />}
                  label="Nama Paket"
                  value={plan?.name ?? "-"}
                />

                <InfoItem
                  icon={<Clock3 size={20} />}
                  label="Durasi"
                  value={
                    plan?.duration != null
                      ? `${plan.duration} bulan`
                      : "-"
                  }
                />

                <InfoItem
                  icon={<CalendarClock size={20} />}
                  label="Tanggal Mulai"
                  value={formatDateOnly(membership.start_date)}
                />

                <InfoItem
                  icon={<CalendarClock size={20} />}
                  label="Tanggal Berakhir"
                  value={formatDateOnly(membership.end_date)}
                />
              </div>

              {/* Harga Paket */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4">
                <p className="text-sm font-medium text-zinc-500">
                  Harga Paket
                </p>

                <p className="text-2xl font-bold tracking-tight text-zinc-900">
                  {formatRupiah(plan?.price ?? 0)}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-amber-800">
              <CircleAlert size={21} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">
                  Membership belum ditemukan
                </p>
                <p className="mt-1 text-sm leading-6">
                  Membership belum terhubung dengan transaksi ini.
                  Transaksi lama mungkin belum memiliki referensi membership.
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 shrink-0 text-zinc-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm text-zinc-500">{label}</p>
        <p
          className={`mt-0.5 break-words text-base font-medium text-zinc-800 ${mono ? "font-mono text-sm" : ""
            }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}