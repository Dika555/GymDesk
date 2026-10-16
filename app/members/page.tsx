"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import MemberModal from "@/components/MemberModal";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import {
  CreditCard,
  User,
  Users,
  ArrowUpRight,
  Pencil,
  Icon
} from "lucide-react";

type Member = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  address: string | null;
  membership: string | null;
  created_at: string;
  memberships: {
    status: string;
    end_date: string;
    membership_plans: {
      name: string;
    }[];
  }[];
};

const ITEMS_PER_PAGE = 10;

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isOpen, setIsOpen] = useState(false);
  const [editingMember, setEditingMember] =
    useState<Member | null>(null);

  async function getMembers() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMembers([]);
      return;
    }

    // Ambil data member
    const { data: memberData, error: memberError } =
      await supabase
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
        .order("created_at", { ascending: false });

    if (memberError) {
      console.error("Gagal mengambil member:", memberError);
      return;
    }

    // Ambil data membership pada cabang aktif
    const { data: membershipData, error: membershipError } =
      await supabase
        .from("memberships")
        .select(`
        id,
        member_id,
        plan_id,
        status,
        end_date
      `)
        .eq("branch_id", branchId);

    if (membershipError) {
      console.error(
        "Gagal mengambil membership:",
        membershipError
      );
      return;
    }

    // Ambil paket membership pada cabang aktif
    const { data: planData, error: planError } = await supabase
      .from("membership_plans")
      .select(`
      id,
      name
    `)
      .eq("branch_id", branchId);

    if (planError) {
      console.error(
        "Gagal mengambil paket membership:",
        planError
      );
      return;
    }

    // Gabungkan data membership dengan nama paket
    const membersWithMembership = (memberData ?? []).map(
      (member) => {
        const memberMemberships = (membershipData ?? [])
          .filter(
            (membership) =>
              membership.member_id === member.id
          )
          .map((membership) => {
            const plan = (planData ?? []).find(
              (plan) => plan.id === membership.plan_id
            );

            return {
              status: membership.status,
              end_date: membership.end_date,
              membership_plans: plan
                ? [{ name: plan.name }]
                : [],
            };
          });

        return {
          ...member,
          memberships: memberMemberships,
        };
      }
    );

    setMembers(membersWithMembership);
  }

  useEffect(() => {
    getMembers();
  }, []);

  const membershipOptions = Array.from(
    new Set(
      members
        .map((member) =>
          member.memberships?.find(
            (membership) =>
              membership.status === "active" &&
              membership.end_date >=
              new Date().toISOString().split("T")[0]
          )?.membership_plans?.[0]?.name
        )
        .filter(Boolean)
    )
  );

  // Filter berdasarkan pencarian
  const filteredMembers = members.filter((member) => {
    const keyword = search.trim().toLowerCase();

    const membershipName =
      member.memberships?.find(
        (membership) =>
          membership.status === "active" &&
          membership.end_date >=
          new Date().toISOString().split("T")[0]
      )?.membership_plans?.[0]?.name ?? "";

    const matchesSearch =
      (member.name ?? "").toLowerCase().includes(keyword) ||
      (member.phone ?? "").toLowerCase().includes(keyword) ||
      membershipName.toLowerCase().includes(keyword);

    const matchesMembership =
      membershipFilter === "all" ||
      (membershipFilter === "none"
        ? membershipName === ""
        : membershipName === membershipFilter);

    return (
      matchesSearch &&
      matchesMembership
    );
  });

  // Jumlah halaman
  const totalPages = Math.ceil(
    filteredMembers.length / ITEMS_PER_PAGE
  );

  // Data yang ditampilkan pada halaman sekarang
  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const currentMembers = filteredMembers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleEdit(member: Member) {
    setEditingMember(member);
    setIsOpen(true);
  }

  function handleSuccess() {
    setIsOpen(false);
    setEditingMember(null);
    getMembers();
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 sm:p-8">
      {/* Header */}

      {/* HEADER HALAMAN */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Users size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Members
            </h1>

            <p className="mt-1 text-sm text-zinc-500 sm:text-base">
              Kelola data member, informasi kontak, serta pantau membership yang sedang dimiliki oleh setiap member.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingMember(null);
            setIsOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          <User size={18} />+
          Tambah Member 
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Search
            value={search}
            onChange={handleSearch}
            placeholder="Cari nama member, nomor HP, atau paket membership..."
          />
        </div>

        <select
          value={membershipFilter}
          onChange={(e) => {
            setMembershipFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 sm:w-52"
        >
          <option value="all">Semua Membership</option>
          <option value="none">Belum Ada</option>

          {membershipOptions.map((membership) => (
            <option key={membership} value={membership}>
              {membership}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[24%]" />
              <col className="w-[22%]" />
              <col className="w-[20%]" />
              <col className="w-[28%]" />
            </colgroup>
            <thead className="bg-zinc-100">
              <tr className="border-b border-zinc-300 text-left">
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  No
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Nama
                </th>

                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  No. HP
                </th>

                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Membership
                </th>

                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {currentMembers.length > 0 ? (
                currentMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className="border-b border-zinc-200 bg-white transition-colors hover:bg-zinc-50 last:border-b-0"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-zinc-700">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-zinc-900">
                      {member.name}
                    </td>

                    <td className="px-4 py-4 text-sm text-zinc-600">
                      {member.phone}
                    </td>

                    <td className="px-4 py-4 text-sm text-zinc-700">
                      {member.memberships?.find(
                        (membership) =>
                          membership.status === "active" &&
                          membership.end_date >=
                          new Date().toISOString().split("T")[0]
                      )?.membership_plans?.[0]?.name ?? "Belum ada"}
                    </td>


                    <td className="px-4 py-4">
                      <div className="gap-2">
                        <a
                          href={`/members/${member.id}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-zinc-50"
                        >
                          <ArrowUpRight size={16} />
                          Detail
                        </a>

                        <button
                          type="button"
                          onClick={() => handleEdit(member)}
                          className="ml-3 inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-zinc-500"
                  >
                    {search
                      ? "Member tidak ditemukan."
                      : "Belum ada data member."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredMembers.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
      <MemberModal
        open={isOpen}
        member={editingMember}
        onClose={() => {
          setIsOpen(false);
          setEditingMember(null);
        }}
        onSuccess={handleSuccess}
      />
    </main>
  );
}