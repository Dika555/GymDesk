
"use client";

import {
    UsersRound,
    UserPlus,
    PackageCheck,
    PackageX,
    Trash2,
} from "lucide-react";

import type {
    TrainerMember,
    AvailableMember,
} from "@/components/trainers/[id]/types";

import Search from "@/components/ui/Search";
import Pagination from "@/components/ui/Pagination";
import TrainerMemberModal from "@/components/trainers/[id]/TrainerMemberModal";

type TrainerMembersSectionProps = {
    members: TrainerMember[];
    filteredMembers: TrainerMember[];
    paginatedMembers: TrainerMember[];
    availableMembers: AvailableMember[];

    memberSearch: string;
    memberFilter: "all" | "active" | "inactive";
    memberPage: number;
    memberTotalPages: number;
    membersPerPage: number;

    trainerStatus: string;
    isMemberFormOpen: boolean;
    selectedMemberId: string;
    savingMember: boolean;

    onSearchChange: (value: string) => void;
    onFilterChange: (
        value: "all" | "active" | "inactive"
    ) => void;
    onPageChange: (page: number) => void;
    onOpenForm: () => void;
    onMemberChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCloseForm: () => void;
    onRemoveMember: (memberId: string) => void;
};

export default function TrainerMembersSection({
    members,
    filteredMembers,
    paginatedMembers,
    availableMembers,
    memberSearch,
    memberFilter,
    memberPage,
    memberTotalPages,
    membersPerPage,
    trainerStatus,
    isMemberFormOpen,
    selectedMemberId,
    savingMember,
    onSearchChange,
    onFilterChange,
    onPageChange,
    onOpenForm,
    onMemberChange,
    onSubmit,
    onCloseForm,
    onRemoveMember,
}: TrainerMembersSectionProps) {
    return (
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            {/* HEADER SECTION */}
            <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                        <UsersRound size={22} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">
                            Member yang Ditangani
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Daftar member yang ditangani oleh trainer ini.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="inline-flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-semibold text-zinc-700">
                        {members.length} Member
                    </span>

                    <button
                        type="button"
                        onClick={onOpenForm}
                        disabled={trainerStatus === "inactive"}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <UserPlus size={17} />
                        Tambah Member
                    </button>
                </div>
            </div>

            {/* SEARCH DAN FILTER */}
            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                    <Search
                        value={memberSearch}
                        onChange={onSearchChange}
                        placeholder="Cari nama member..."
                    />
                </div>

                <select
                    value={memberFilter}
                    onChange={(event) =>
                        onFilterChange(
                            event.target.value as
                                | "all"
                                | "active"
                                | "inactive"
                        )
                    }
                    aria-label="Filter status paket member"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 md:w-56"
                >
                    <option value="all">Semua Status</option>
                    <option value="active">Punya Paket Aktif</option>
                    <option value="inactive">Tidak Ada Paket Aktif</option>
                </select>
            </div>

            {/* MODAL TAMBAH MEMBER */}
            {isMemberFormOpen && (
                <TrainerMemberModal
                    availableMembers={availableMembers}
                    selectedMemberId={selectedMemberId}
                    onMemberChange={onMemberChange}
                    onSubmit={onSubmit}
                    onClose={onCloseForm}
                    saving={savingMember}
                />
            )}

            {/* KONDISI KOSONG */}
            {members.length === 0 ? (
                <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm">
                        <UsersRound size={24} />
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-zinc-800">
                        Belum Ada Member
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-zinc-500">
                        Belum ada member yang ditangani oleh trainer ini.
                    </p>
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm">
                        <UsersRound size={24} />
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-zinc-800">
                        Member Tidak Ditemukan
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                        Coba ubah kata kunci atau filter status.
                    </p>
                </div>
            ) : (
                /* TABEL MEMBER */
                <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-200">
                    <table className="w-full min-w-[650px] text-left text-sm">
                        <thead className="bg-zinc-100">
                            <tr className="border-b-2 border-zinc-200">
                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    No.
                                </th>

                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Nama Member
                                </th>

                                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Status Paket
                                </th>

                                <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-zinc-100">
                            {paginatedMembers.map((member, index) => (
                                <tr
                                    key={member.id}
                                    className="transition-colors hover:bg-zinc-50"
                                >
                                    <td className="whitespace-nowrap px-4 py-4 text-zinc-500">
                                        {(memberPage - 1) *
                                            membersPerPage +
                                            index +
                                            1}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span className="font-semibold text-zinc-900">
                                            {member.name}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        {member.has_active_package ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                                                <PackageCheck size={14} />
                                                {member.remaining_sessions} sesi tersisa
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-600">
                                                <PackageX size={14} />
                                                Tidak ada paket aktif
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-4 text-right">
                                        {member.remaining_sessions > 0 ? (
                                            <span className="text-xs text-zinc-400">
                                                Tidak dapat dihapus
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onRemoveMember(member.id)
                                                }
                                                disabled={
                                                    trainerStatus === "inactive"
                                                }
                                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Trash2 size={14} />
                                                Hapus
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PAGINATION */}
            {filteredMembers.length > 0 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={memberPage}
                        totalPages={memberTotalPages}
                        totalItems={filteredMembers.length}
                        itemsPerPage={membersPerPage}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </section>
    );
}
