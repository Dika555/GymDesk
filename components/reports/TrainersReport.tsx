"use client";

import { useState } from "react";
import Pagination from "@/components/ui/Pagination";
import {
  Users,
  CalendarCheck,
  Wallet,
  Dumbbell,
} from "lucide-react";

type TrainerReportItem = {
  id: string;
  name: string;
  memberCount: number;
  sessionCount: number;
  revenue: number;
};

type TrainersReportProps = {
  trainers: TrainerReportItem[];
};

const ITEMS_PER_PAGE = 20;

function formatCurrency(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function TrainersReport({
  trainers,
}: TrainersReportProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalMembers = trainers.reduce(
    (total, trainer) => total + trainer.memberCount,
    0
  );

  const totalSessions = trainers.reduce(
    (total, trainer) => total + trainer.sessionCount,
    0
  );

  const totalRevenue = trainers.reduce(
    (total, trainer) => total + trainer.revenue,
    0
  );

  const totalPages = Math.ceil(
    trainers.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentTrainers = trainers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3 border-b border-zinc-200 pb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <Dumbbell size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">
            Data Trainer
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Pratinjau aktivitas trainer berdasarkan periode laporan.
          </p>
        </div>
      </div>

      {trainers.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">
          Tidak ada data trainer pada periode ini.
        </p>
      ) : (
        <>
          {/* Ringkasan laporan */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {/* Total Member */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-500">
                    Total Member Ditangani
                  </p>

                  <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">
                    {totalMembers.toLocaleString("id-ID")}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Member yang ditangani seluruh trainer
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Users size={22} />
                </div>
              </div>
            </div>

            {/* Total Sesi */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-500">
                    Total Sesi
                  </p>

                  <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">
                    {totalSessions.toLocaleString("id-ID")}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Sesi latihan pada periode laporan
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <CalendarCheck size={22} />
                </div>
              </div>
            </div>

            {/* Pendapatan Trainer */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-sm sm:col-span-2 xl:col-span-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-500">
                    Pendapatan Trainer
                  </p>

                  <p className="mt-3 break-words text-2xl font-bold tracking-tight text-zinc-900">
                    {formatCurrency(totalRevenue)}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Total pendapatan pada periode laporan
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Wallet size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabel trainer */}
          <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-zinc-100">
                  <tr className="border-b-2 border-zinc-300 text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      No.
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Trainer
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Member Ditangani
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Total Sesi
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Pendapatan
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-200">
                  {currentTrainers.map((trainer, index) => (
                    <tr
                      key={trainer.id}
                      className="transition-colors hover:bg-zinc-50"
                    >
                      <td className="px-4 py-3.5 text-sm text-zinc-500">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-4 py-3.5 text-sm font-medium text-zinc-900">
                        {trainer.name}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {trainer.memberCount} member
                      </td>

                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {trainer.sessionCount} sesi
                      </td>

                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {formatCurrency(trainer.revenue)}
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
            totalItems={trainers.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
}