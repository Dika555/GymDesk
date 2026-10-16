"use client";

import { useState } from "react";
import Pagination from "@/components/ui/Pagination";
import {
  CalendarCheck
} from "lucide-react";

type VisitReportItem = {
  id: string;
  memberName: string;
  visitDate: string;
  visitFee: number;
  paymentMethod: string | null;
  isMember: boolean;
};

type VisitsReportProps = {
  visits: VisitReportItem[];
};

const ITEMS_PER_PAGE = 20;

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

function formatPaymentMethod(method: string | null) {
  if (!method) return "-";

  if (method === "cash") return "Cash";
  if (method === "qris") return "QRIS";
  if (method === "transfer") return "Transfer";

  return method;
}

export default function VisitsReport({
  visits,
}: VisitsReportProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    visits.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentVisits = visits.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <CalendarCheck size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
            Data Kunjungan
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Pratinjau riwayat kunjungan berdasarkan periode laporan.
          </p>
        </div>
      </div>

      {visits.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">
          Tidak ada data kunjungan pada periode ini.
        </p>
      ) : (
        <>
          <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-zinc-100">
                  <tr className="border-b-2 border-zinc-300 text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      No.
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Member / Pengunjung
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Jenis
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Biaya
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Pembayaran
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-200">
                  {currentVisits.map((visit, index) => (
                    <tr
                      key={visit.id}
                      className="transition-colors hover:bg-zinc-50"
                    >
                      <td className="px-4 py-3.5 text-sm text-zinc-500">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {formatDate(visit.visitDate)}
                      </td>

                      <td className="px-4 py-3.5 text-sm font-medium text-zinc-900">
                        {visit.memberName}
                      </td>

                      <td className="px-4 py-3.5 text-sm">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${visit.isMember
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-orange-200 bg-orange-50 text-orange-700"
                            }`}
                        >
                          {visit.isMember ? "Member" : "Non-Member"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {formatCurrency(visit.visitFee)}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {formatPaymentMethod(visit.paymentMethod)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={visits.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
}