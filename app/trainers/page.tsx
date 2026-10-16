"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import TrainerFormModal from "@/components/trainers/TrainerFormModal";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import FeedbackModal from "@/components/FeedbackModal";
import {
  Dumbbell,
  Phone,
  Users,
  ArrowUpRight
} from "lucide-react";

type Trainer = {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  status: "active" | "inactive";
  created_at: string;
  memberCount: number;
};

type FeedbackType = "success" | "error" | "warning" | "info";

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [pricePerSession, setPricePerSession] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    open: false,
    title: "",
    message: "",
    type: "info" as FeedbackType,
  });

  function showFeedback(
    title: string,
    message: string,
    type: FeedbackType = "info",
  ) {
    setFeedback({
      open: true,
      title,
      message,
      type,
    });
  }

  function closeFeedback() {
    setFeedback((prev) => ({
      ...prev,
      open: false,
    }));
  }

  useEffect(() => {
    loadTrainers();
  }, []);

  async function addTrainer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    const formData = new FormData(e.currentTarget);

    const trainerName = String(
      formData.get("name") ?? "",
    ).trim();

    const trainerPhone = String(
      formData.get("phone") ?? "",
    ).trim();

    const trainerSpecialization = String(
      formData.get("specialization") ?? "",
    ).trim();

    if (!trainerName) {
      showFeedback(
        "Nama Belum Diisi",
        "Nama trainer wajib diisi.",
        "warning",
      );
      return;
    }

    const branchId = getActiveBranchId();

    if (!branchId) {
      showFeedback(
        "Cabang Belum Dipilih",
        "Pilih cabang aktif sebelum menambahkan trainer.",
        "warning",
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("trainers")
        .insert({
          name: trainerName,
          phone: trainerPhone,
          specialization: trainerSpecialization,
          branch_id: branchId,
        });

      if (error) {
        console.error("Gagal menambahkan trainer:", error);

        showFeedback(
          "Gagal Menambahkan Trainer",
          "Data trainer belum berhasil disimpan. Silakan coba lagi.",
          "error",
        );
        return;
      }

      setIsOpen(false);

      setName("");
      setPhone("");
      setSpecialization("");

      await loadTrainers();

      showFeedback(
        "Trainer Berhasil Ditambahkan",
        "Data trainer berhasil disimpan.",
        "success",
      );
    } catch (error) {
      console.error("Terjadi kesalahan saat menambahkan trainer:", error);

      showFeedback(
        "Terjadi Kesalahan",
        "Trainer gagal ditambahkan. Silakan coba lagi.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadTrainers() {
    const supabase = createClient();
    const branchId = getActiveBranchId();

    if (!branchId) {
      setTrainers([]);
      return;
    }

    const { data, error } = await supabase
      .from("trainers")
      .select(
        "id, name, phone, specialization, branch_id, status, created_at"
      )
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data trainer:", error);
      return;
    }

    const trainerIds = (data ?? []).map((trainer) => trainer.id);

    let memberRelations: {
      trainer_id: string;
      member_id: string;
    }[] = [];

    if (trainerIds.length > 0) {
      const { data: relations, error: relationError } =
        await supabase
          .from("trainer_members")
          .select("trainer_id, member_id")
          .in("trainer_id", trainerIds);

      if (relationError) {
        console.error(
          "Gagal mengambil hubungan trainer-member:",
          relationError
        );
        return;
      }

      memberRelations = relations ?? [];
    }

    const memberCountMap = new Map<string, number>();

    for (const relation of memberRelations) {
      memberCountMap.set(
        relation.trainer_id,
        (memberCountMap.get(relation.trainer_id) ?? 0) + 1
      );
    }

    const formattedTrainers = (data ?? []).map((trainer) => ({
      id: trainer.id,
      name: trainer.name,
      phone: trainer.phone,
      specialization: trainer.specialization,
      status: trainer.status,
      created_at: trainer.created_at,
      memberCount: memberCountMap.get(trainer.id) ?? 0,
    }));

    formattedTrainers.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "active" ? -1 : 1;
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });

    setTrainers(formattedTrainers);
  }

  const filteredTrainers = trainers.filter((trainer) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      trainer.name.toLowerCase().includes(keyword) ||
      trainer.phone.toLowerCase().includes(keyword) ||
      trainer.specialization.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      trainer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(
    filteredTrainers.length / ITEMS_PER_PAGE
  );

  const currentTrainers = filteredTrainers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  return (
    <>
      <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 sm:p-8">
        {/* HEADER HALAMAN */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Dumbbell size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Personal Trainers
              </h1>
              <p className="mt-1 text-sm text-zinc-500 sm:text-base">
                Kelola data trainer dan pantau member yang ditangani.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <Dumbbell size={18} />+
            Tambah Trainer
          </button>
        </div>

        {/* PENCARIAN DAN FILTER */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <Search
              value={search}
              onChange={(value) => {
                setSearch(value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama, nomor HP, atau spesialisasi..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 sm:w-48"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>

        {/* DAFTAR TRAINER */}
        {filteredTrainers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <Dumbbell size={22} />
            </div>

            <p className="text-sm font-semibold text-zinc-700">
              {search || statusFilter !== "all"
                ? "Trainer tidak ditemukan."
                : "Belum ada data trainer."}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              {search || statusFilter !== "all"
                ? "Coba ubah kata kunci atau filter status."
                : "Tambahkan trainer untuk mulai mengelola data pelatih gym."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {currentTrainers.map((trainer) => (
              <div
                key={trainer.id}
                onClick={() => {
                  window.location.href = `/trainers/${trainer.id}`;
                }}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
              >
                {/* Header card */}
                <div className="bg-orange-500 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3 border-b border-orange-400 pb-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
                        <Dumbbell size={22} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-white">
                          {trainer.name}
                        </h3>
                        <p className="mt-1 text-sm text-white/90">Trainer</p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${trainer.status === "active"
                        ? "bg-white text-emerald-700"
                        : "bg-zinc-100 text-zinc-600"
                        }`}
                    >
                      {trainer.status === "active" ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </div>
                </div>

                {/* Informasi trainer */}
                <div className="space-y-4 p-5 sm:p-6">

                  {/* Member Ditangani */}
                  <div className="rounded-xl border border-zinc-200 bg-orange-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        <Users size={20} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-zinc-500">
                          Member Ditangani
                        </p>
                        <p className="mt-1 text-lg font-bold text-zinc-900">
                          {trainer.memberCount} member
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nomor Telepon */}
                  <div className="flex items-start gap-3">
                    <Phone size={17} className="mt-0.5 shrink-0 text-zinc-400" />
                    <div>
                      <p className="text-xs font-medium text-zinc-500">
                        Nomor Telepon
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-800">
                        {trainer.phone || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Spesialisasi */}
                  <div className="flex items-start gap-3">
                    <Dumbbell size={17} className="mt-0.5 shrink-0 text-zinc-400" />
                    <div>
                      <p className="text-xs font-medium text-zinc-500">
                        Spesialisasi
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-800">
                        {trainer.specialization || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Footer card */}
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-zinc-200 pt-5">
                    <span className="text-xs font-medium text-zinc-500 transition group-hover:text-orange-700">
                      Lihat detail
                    </span>

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 transition group-hover:bg-orange-100">
                      <ArrowUpRight size={20} color="#EA580C" />
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTrainers.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* MODAL TAMBAH TRAINER */}
        {isOpen && (
          <TrainerFormModal
            name={name}
            phone={phone}
            specialization={specialization}
            loading={loading}
            onNameChange={setName}
            onPhoneChange={setPhone}
            onSpecializationChange={setSpecialization}
            pricePerSession={pricePerSession}
            onPricePerSessionChange={setPricePerSession}
            onSubmit={addTrainer}
            onClose={() => setIsOpen(false)}
          />
        )}
      </main>

      <FeedbackModal
        open={feedback.open}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
        onClose={closeFeedback}
      />
    </>
  );
}