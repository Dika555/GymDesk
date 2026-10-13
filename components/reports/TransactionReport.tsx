"use client";

import { useState } from "react";
import { ReceiptText } from "lucide-react";
import Pagination from "@/components/Pagination";

type TransactionReportItem = {
  id: string;
  transactionDate: string;
  transactionType: string;
  memberName: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  notes: string | null;
};

type Props = {
  transactions: TransactionReportItem[];
};

const ITEMS_PER_PAGE = 20;

export default function TransactionReport({
  transactions,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    transactions.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentTransactions = transactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
      case "trainer":
        return "Trainer";
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
    switch (status.toLowerCase()) {
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

  function getStatusStyle(status: string) {
    switch (status.toLowerCase()) {
      case "completed":
        return "border-green-200 bg-green-50 text-green-700";
      case "pending":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
      case "cancelled":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-zinc-200 bg-zinc-100 text-zinc-600";
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      {/* Judul laporan */}
      <div className="flex items-start gap-3 border-b border-zinc-200 pb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <ReceiptText size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">
            Data Transaksi
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Pratinjau daftar transaksi berdasarkan periode laporan.
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">
          Tidak ada transaksi pada periode ini.
        </p>
      ) : (
        <>
          {/* Tabel transaksi */}
          <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-zinc-100">
                  <tr className="border-b-2 border-zinc-300">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      No.
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Jenis
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Member
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Pembayaran
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Total
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-200">
                  {currentTransactions.map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      className="transition-colors hover:bg-zinc-50"
                    >
                      <td className="px-4 py-3.5 text-sm text-zinc-500">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {formatDate(transaction.transactionDate)}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {formatType(transaction.transactionType)}
                      </td>

                      <td className="px-4 py-3.5 text-sm font-medium text-zinc-900">
                        {transaction.memberName}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {formatPaymentMethod(transaction.paymentMethod)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-semibold text-zinc-900">
                        {formatCurrency(transaction.totalAmount)}
                      </td>

                      <td className="px-4 py-3.5 text-sm">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(transaction.status)}`}
                        >
                          {formatStatus(transaction.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={transactions.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
}