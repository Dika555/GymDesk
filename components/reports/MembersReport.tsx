"use client";

import { useState } from "react";
import Pagination from "@/components/ui/Pagination";
import {
  Users
} from "lucide-react";

type MemberReport = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  address: string | null;
  membership: string | null;
  created_at: string;
};

type MembersReportProps = {
  members: MemberReport[];
};

const ITEMS_PER_PAGE = 20;

export default function MembersReport({
  members,
}: MembersReportProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Menghitung jumlah halaman
  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);

  // Mengambil data sesuai halaman yang sedang dibuka
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentMembers = members.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Format tanggal untuk tampilan laporan
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <Users size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
            Data Member
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Daftar data member gym.
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-zinc-100">
              <tr className="border-b-2 border-zinc-300 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  No.
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Nama
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  No. HP
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Email
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Gender
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Alamat
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Membership
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Tanggal Bergabung
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200">
              {currentMembers.length > 0 ? (
                currentMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-zinc-50"
                  >
                    <td className="px-4 py-3.5 text-sm text-zinc-500">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-zinc-900">
                      {member.name}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-600">
                      {member.phone || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-600">
                      {member.email || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-600">
                      {member.gender || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-600">
                      {member.address || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-600">
                      {member.membership || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-600">
                      {formatDate(member.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-zinc-500"
                  >
                    Tidak ada data member pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={members.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}