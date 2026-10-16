"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import AddVisitButton from "@/components/AddVisitButton";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import FeedbackModal from "@/components/FeedbackModal";

import {
  Users,
  CalendarDays,
  CalendarCheck,
} from "lucide-react";

type Visit = {
  id: string;
  member_id: string | null;
  visitor_name: string | null;
  visit_date: string;
  visit_fee: number;
  payment_method: string | null;
  member: {
    name: string;
  } | null;
};

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  async function getVisits() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setVisits([]);
      return;
    }

    // Ambil data kunjungan
    const { data: visitData, error: visitError } = await supabase
      .from("visits")
      .select(`
        id,
        member_id,
        visitor_name,
        visit_date,
        visit_fee,
        payment_method,
        created_at
      `)
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .order("visit_date", { ascending: false });

    if (visitError) {
      console.error("Gagal mengambil data kunjungan.");
      return;
    }

    // Ambil data member dari cabang aktif
    const { data: memberData, error: memberError } = await supabase
      .from("members")
      .select("id, name")
      .eq("branch_id", branchId);

    if (memberError) {
      console.error("Gagal mengambil data member.");
      return;
    }

    // Buat pasangan ID member → nama member
    const membersMap = new Map(
      (memberData ?? []).map((member) => [
        member.id,
        member.name,
      ])
    );

    // Gabungkan data visit dengan nama member
    const formattedVisits: Visit[] = (visitData ?? []).map((visit) => ({
      id: visit.id,
      member_id: visit.member_id,
      visitor_name: visit.visitor_name,
      visit_date: visit.visit_date,
      visit_fee: visit.visit_fee,
      payment_method: visit.payment_method,

      member: visit.member_id
        ? {
          name:
            membersMap.get(visit.member_id) ??
            "Member tidak ditemukan",
        }
        : null,
    }));

    setVisits(formattedVisits);
  }

  useEffect(() => {
    getVisits();
  }, []);

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

  const filteredVisits = visits.filter((visit) => {
    const keyword = search.toLowerCase();

    const name =
      visit.member?.name ??
      visit.visitor_name ??
      "";

    const formattedDate = formatDate(visit.visit_date);

    const isMember = visit.member !== null;

    const matchesSearch =
      name.toLowerCase().includes(keyword) ||
      formattedDate.toLowerCase().includes(keyword);

    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "member" && isMember) ||
      (typeFilter === "non-member" && !isMember);

    const matchesPayment =
      paymentFilter === "all" ||
      visit.payment_method === paymentFilter;

    return (
      matchesSearch &&
      matchesType &&
      matchesPayment
    );
  });

  const totalPages = Math.ceil(
    filteredVisits.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentVisits = filteredVisits.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
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

      {/* HEADER HALAMAN */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <CalendarCheck size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Kunjungan
            </h1>

            <p className="mt-1 text-sm text-zinc-500 sm:text-base">
              Catat dan pantau riwayat kunjungan member maupun non-member.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <AddVisitButton
            onSuccess={async () => {
              await getVisits();

              showFeedback(
                "Kunjungan Berhasil Dicatat",
                "Data kunjungan berhasil disimpan.",
                "success"
              );
            }}
          />
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <Search
            value={search}
            onChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama atau tanggal..."
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 sm:w-auto"
        >
          <option value="all">Semua Tipe</option>
          <option value="member">Member</option>
          <option value="non-member">Non-member</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 sm:w-auto"
        >
          <option value="all">Semua Pembayaran</option>
          <option value="cash">Cash</option>
          <option value="transfer">Transfer</option>
          <option value="qris">QRIS</option>
        </select>
      </div>

      {/* TABEL KUNJUNGAN */}
      {filteredVisits.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[750px] text-left">
            <thead>
              <tr className="border-b-2 border-zinc-200 bg-zinc-100">
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
                  Tipe
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Biaya
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Pembayaran
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {currentVisits.map((visit, index) => {
                const isMember = visit.member !== null;

                return (
                  <tr
                    key={visit.id}
                    className="transition-colors hover:bg-zinc-50"
                  >
                    <td className="px-4 py-4 text-sm text-zinc-500">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-4 py-4 text-sm text-zinc-600">
                      {formatDate(visit.visit_date)}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-zinc-900">
                      {visit.member?.name ?? visit.visitor_name ?? "-"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${isMember
                          ? "bg-blue-50 text-blue-700 ring-blue-200"
                          : "bg-zinc-100 text-zinc-700 ring-zinc-200"
                          }`}
                      >
                        {isMember ? "Member" : "Non-member"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-zinc-700">
                      {formatCurrency(visit.visit_fee)}
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold capitalize text-zinc-700">
                        {visit.payment_method ?? "-"}
                      </span>
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
            {search ||
              typeFilter !== "all" ||
              paymentFilter !== "all"
              ? "Data kunjungan tidak ditemukan."
              : "Belum ada data kunjungan."}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {search ||
              typeFilter !== "all" ||
              paymentFilter !== "all"
              ? "Coba ubah kata kunci atau filter yang dipilih."
              : "Data kunjungan akan muncul setelah kunjungan dicatat."}
          </p>
        </div>
      )}

      {/* PAGINATION */}
      <div className="mt-5">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredVisits.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

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