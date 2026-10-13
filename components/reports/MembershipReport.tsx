"use client";

import { useState } from "react";
import Pagination from "@/components/Pagination";
import {
  IdCard
} from "lucide-react";

type MembershipReportItem = {
  id: string;
  memberName: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
};

type MembershipReportProps = {
  memberships: MembershipReportItem[];
};

const ITEMS_PER_PAGE = 10;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MembershipReport({
  memberships,
}: MembershipReportProps) {
  const groupedMemberships = memberships.reduce(
    (groups, membership) => {
      if (!groups[membership.planName]) {
        groups[membership.planName] = [];
      }

      groups[membership.planName].push(membership);

      return groups;
    },
    {} as Record<string, MembershipReportItem[]>
  );

  const planNames = Object.keys(groupedMemberships);

  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <IdCard size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
            Data Membership
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Pratinjau data membership berdasarkan paket pada periode laporan.
          </p>
        </div>
      </div>

      {planNames.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">
          Tidak ada data membership pada periode ini.
        </p>
      ) : (
        <div className="mt-5 space-y-6">
          {planNames.map((planName) => (
            <MembershipPlanTable
              key={planName}
              planName={planName}
              memberships={groupedMemberships[planName]}
            />
          ))}
        </div>
      )}
    </section>
  );
}

type MembershipPlanTableProps = {
  planName: string;
  memberships: MembershipReportItem[];
};

function MembershipPlanTable({
  planName,
  memberships,
}: MembershipPlanTableProps) {
  // Setiap tabel paket mempunyai halaman masing-masing
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    memberships.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentMemberships = memberships.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200">
      <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
        <h3 className="font-semibold text-zinc-900">
          {planName}
        </h3>

        <p className="mt-1 text-xs text-zinc-500">
          {memberships.length} data membership
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-zinc-100">
            <tr className="border-b-2 border-zinc-300 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                No.
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Member
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Tanggal Mulai
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Tanggal Berakhir
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200">
            {currentMemberships.map((membership, index) => (
              <tr
                key={membership.id}
                className="transition-colors hover:bg-zinc-50"
              >
                <td className="px-4 py-3.5 text-sm text-zinc-500">
                  {startIndex + index + 1}
                </td>

                <td className="px-4 py-3.5 text-sm font-medium text-zinc-900">
                  {membership.memberName}
                </td>

                <td className="px-4 py-3.5 text-sm text-zinc-600">
                  {formatDate(membership.startDate)}
                </td>

                <td className="px-4 py-3.5 text-sm text-zinc-600">
                  {formatDate(membership.endDate)}
                </td>

                <td className="px-4 py-3.5 text-sm">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${membership.status === "active"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-zinc-200 bg-zinc-100 text-zinc-600"
                      }`}
                  >
                    {membership.status === "active"
                      ? "Aktif"
                      : membership.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-zinc-200 px-4 pb-3">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={memberships.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}