"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import AddTransactionButton from "@/components/AddTransactionButton";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import FeedbackModal from "@/components/FeedbackModal";
import {
  ReceiptText,
  ArrowUpRight,
} from "lucide-react";

type TransactionItem = {
  product_id: string | null;
  quantity: number;
  unit_price: number;
  products: {
    name: string;
  } | null;
};

  type Transaction = {
    id: string;
    transaction_type: string;
    payment_method: string;
    total_amount: number;
    status: string;
    transaction_date: string;
    created_at: string;
    notes: string | null;
    customer_name: string | null;
    members: {
      name: string;
    } | null;
    transaction_items: TransactionItem[];
  };

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  async function getTransactions() {
    setLoading(true);

    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        transaction_type,
        payment_method,
        total_amount,
        status,
        transaction_date,
        created_at,
        notes,
        customer_name,
        members!transactions_member_id_fkey (
          id,
          name
        ),
        transaction_items (
          product_id,
          quantity,
          unit_price,
          products (
            name
          )
        )
      `)
      .eq("branch_id", branchId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Gagal mengambil transaksi:",
        error,
      );

      setLoading(false);
      return;
    }

    setTransactions(
      (data ?? []).map((transaction) => {
        const memberData = transaction.members;

        const member = Array.isArray(memberData)
          ? memberData[0] ?? null
          : memberData ?? null;

        return {
          ...transaction,

          members: member,

          transaction_items:
            (transaction.transaction_items ?? []).map(
              (item) => ({
                ...item,
                products: Array.isArray(item.products)
                  ? item.products[0] ?? null
                  : item.products ?? null,
              }),
            ),
        };
      }),
    );


    setLoading(false);
  }

  useEffect(() => {
    getTransactions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, paymentFilter, statusFilter]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  }

  function formatCurrency(amount: number) {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }

  function formatType(type: string) {
    switch (type) {
      case "registration":
        return "Pendaftaran";

      case "membership":
        return "Membership";

      case "product":
        return "Produk";

      case "trainer_package":
        return "Paket Trainer";

      default:
        return "Lainnya";
    }
  }

  function formatPaymentMethod(method: string) {
    switch (method) {
      case "cash":
        return "Cash";

      case "qris":
        return "QRIS";

      case "transfer":
        return "Transfer";

      default:
        return method;
    }
  }

  function formatStatus(status: string) {
    switch (status) {
      case "completed":
        return "Selesai";

      case "pending":
        return "Menunggu";

      case "cancelled":
        return "Dibatalkan";

      default:
        return status;
    }
  }

  function getPurchaseNames(
    transaction: Transaction,
  ) {
    const names = transaction.transaction_items
      .map(
        (item) =>
          item.products?.name ?? "",
      )
      .filter(Boolean);

    return names.join(" ");
  }

  const filteredTransactions =
    transactions.filter(
      (transaction) => {
        const keyword =
          search.trim().toLowerCase();

        const memberName =
          transaction.members?.name?.toLowerCase() ??
          "";

        const customerName =
          transaction.customer_name?.toLowerCase() ??
          "";

        const formattedDate = formatDate(
          transaction.transaction_date,
        ).toLowerCase();

        const purchaseNames = getPurchaseNames(
          transaction,
        ).toLowerCase();

        const matchesSearch =
          memberName.includes(keyword) ||
          customerName.includes(keyword) ||
          formattedDate.includes(keyword) ||
          purchaseNames.includes(keyword);

        const matchesPayment =
          paymentFilter === "all" ||
          transaction.payment_method === paymentFilter;

        const matchesStatus =
          statusFilter === "all" ||
          transaction.status === statusFilter;

        return (
          matchesSearch &&
          matchesPayment &&
          matchesStatus
        );
      },
    );

  const totalPages = Math.ceil(
    filteredTransactions.length /
    ITEMS_PER_PAGE,
  );

  const startIndex =
    (currentPage - 1) *
    ITEMS_PER_PAGE;

  const currentTransactions =
    filteredTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );

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

  return (

    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <ReceiptText size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Transaksi
            </h1>

            <p className="mt-1 text-sm text-zinc-500 sm:text-base">
              Catat transaksi dan lihat riwayat seluruh transaksi GymDesk.
            </p>
          </div>
        </div>

        <AddTransactionButton
          onSuccess={() => {
            void getTransactions();

            showFeedback(
              "Transaksi Berhasil Disimpan",
              "Data transaksi berhasil disimpan.",
              "success"
            );
          }}
        />
      </div>


      {/* Search & Filter */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px_200px]">
        <Search
          value={search}
          onChange={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          placeholder="Cari tanggal atau nama pelanggan..."
        />

        {/* Filter Pembayaran */}
        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-700 outline-none focus:border-orange-500"
        >
          <option value="all">Semua Pembayaran</option>
          <option value="cash">Cash</option>
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer</option>
        </select>

        {/* Filter Status */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-700 outline-none focus:border-orange-500"
        >
          <option value="all">Semua Status</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white">
        {/* Loading */}
        {loading ? (
          <p className="py-10 text-center text-gray-500">
            Memuat transaksi...
          </p>
        ) : filteredTransactions.length === 0 ? (
          <p className="py-10 text-center text-gray-500">
            Tidak ada transaksi ditemukan.
          </p>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b-2 border-zinc-200 bg-zinc-100 text-left">
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                      No
                    </th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                      Tanggal
                    </th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                      Nama
                    </th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                      Tipe Pembelian
                    </th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                      Pembayaran
                    </th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                      Total
                    </th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                      Status
                    </th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {currentTransactions.map(
                    (transaction, index) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                          {startIndex +
                            index +
                            1}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                          {formatDate(
                            transaction.transaction_date,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-zinc-900">
                          {transaction.members?.name ??
                            transaction.customer_name ??
                            "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                          {formatType(
                            transaction.transaction_type,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                          {formatPaymentMethod(
                            transaction.payment_method,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-zinc-900">
                          {formatCurrency(
                            transaction.total_amount,
                          )}
                        </td>

                        <td className="px-4 py-4">

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${transaction.status === "completed"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : transaction.status === "cancelled"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-zinc-200 bg-zinc-100 text-zinc-600"
                              }`}
                          >
                            {formatStatus(transaction.status)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <Link
                            href={`/transactions/${transaction.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100"
                          >
                            <ArrowUpRight size={16} />
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredTransactions.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
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