"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import AddMembershipModal from "@/components/memberships/AddMembershipModal";
import Search from "@/components/ui/Search";
import Pagination from "@/components/ui/Pagination";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { useSearchParams } from "next/navigation";

import {
  Dumbbell,
  IdCard,
  Users,
  CheckCircle2,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
} from "lucide-react";

type MembershipPlan = {
  id: string;
  name: string;
  duration: number;
  price: number;
  benefits: string[];
  is_active: boolean;
  memberCount: number;
};

function MembershipContent() {
  const supabase = createClient();
  const router = useRouter();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [benefits, setBenefits] = useState("");
  const [saving, setSaving] = useState(false);

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

  const [search, setSearch] = useState("");
  const [durationFilter, setDurationFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedBenefits, setExpandedBenefits] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const deleted = searchParams.get("deleted");

  useEffect(() => {
    if (deleted === "success") {
      showFeedback(
        "Paket Berhasil Dihapus",
        "Paket membership berhasil dihapus.",
        "success"
      );

      window.history.replaceState({}, "", "/membership");
    }
  }, [deleted]);

  const ITEMS_PER_PAGE = 6;

  async function getPlans() {
    setLoading(true);

    try {
      const branchId = await getActiveBranchId();

      if (!branchId) {
        setPlans([]);
        return;
      }

      const { data, error } = await supabase
        .from("membership_plans")
        .select("id, name, duration, price, benefits, is_active")
        .eq("branch_id", branchId)
        .order("price", { ascending: true });

      if (error) {
        console.error("Gagal mengambil paket membership:", error);
        return;
      }

      const plansWithCount = await Promise.all(
        (data ?? []).map(async (plan) => {
          const { count, error: countError } = await supabase
            .from("memberships")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("plan_id", plan.id)
            .eq("branch_id", branchId)
            .eq("status", "active");

          if (countError) {
            console.error("Gagal menghitung member:", countError);
          }

          return {
            ...plan,
            benefits: plan.benefits ?? [],
            memberCount: count ?? 0,
          };
        })
      );

      setPlans(plansWithCount);
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMembership(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    // Validasi input wajib
    if (!name.trim() || !duration || !price) {
      showFeedback(
        "Data Belum Lengkap",
        "Nama, durasi, dan harga wajib diisi.",
        "warning"
      );
      return;
    }

    const numericDuration = Number(duration);
    const numericPrice = Number(price);

    // Validasi durasi dan harga
    if (
      !Number.isInteger(numericDuration) ||
      numericDuration <= 0 ||
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      showFeedback(
        "Data Tidak Valid",
        "Durasi harus berupa bilangan bulat positif dan harga tidak boleh negatif.",
        "warning"
      );
      return;
    }

    setSaving(true);

    try {
      const branchId = await getActiveBranchId();

      if (!branchId) {
        showFeedback(
          "Cabang Tidak Ditemukan",
          "Cabang aktif tidak ditemukan. Periksa pilihan cabang terlebih dahulu.",
          "error"
        );
        return;
      }

      const benefitList = benefits
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("membership_plans")
        .insert({
          name: name.trim(),
          duration: numericDuration,
          price: numericPrice,
          benefits: benefitList,
          branch_id: branchId,
        });

      if (error) {
        console.error("Gagal menambahkan membership:", error);

        showFeedback(
          "Gagal Menyimpan",
          "Paket membership gagal ditambahkan. Silakan coba kembali.",
          "error"
        );
        return;
      }

      // Kosongkan form
      setName("");
      setDuration("");
      setPrice("");
      setBenefits("");
      setIsFormOpen(false);
      setCurrentPage(1);

      // Perbarui daftar paket
      await getPlans();

      // Tampilkan notifikasi sukses
      showFeedback(
        "Membership Berhasil Ditambahkan",
        "Paket membership baru berhasil disimpan.",
        "success"
      );
    } catch (error) {
      console.error("Terjadi kesalahan saat menyimpan membership:", error);

      showFeedback(
        "Terjadi Kesalahan",
        "Terjadi kesalahan saat menyimpan paket membership. Silakan coba kembali.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    getPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => {
    const keyword = search.toLowerCase();
    const benefitsText = (plan.benefits ?? []).join(" ");

    const matchesSearch =
      plan.name.toLowerCase().includes(keyword) ||
      benefitsText.toLowerCase().includes(keyword);

    const matchesDuration =
      durationFilter === "all" ||
      plan.duration.toString() === durationFilter;

    return matchesSearch && matchesDuration;
  });

  const durationOptions = Array.from(
    new Set(plans.map((plan) => plan.duration))
  ).sort((a, b) => a - b);

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }

    return 0;
  });

  const totalPages = Math.ceil(
    sortedPlans.length / ITEMS_PER_PAGE
  );

  const paginatedPlans = sortedPlans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col p-5 sm:p-8">
      {/* Header halaman */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Users size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Paket Membersip
            </h1>

            <p className="mt-1 text-sm text-zinc-500 sm:text-base">
              Kelola paket membership gym, mulai dari melihat durasi, harga, hingga memeriksa benefit serta jumlah member.
            </p>
          </div>
        </div>


        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          <IdCard size={18} />+
          Tambah Paket Membership
        </button>
      </div>

      {/* Pencarian dan filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <Search
            value={search}
            onChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            placeholder="Cari paket membership..."
          />
        </div>

        <select
          value={durationFilter}
          onChange={(e) => {
            setDurationFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">Semua Durasi</option>

          {durationOptions.map((itemDuration) => (
            <option key={itemDuration} value={itemDuration.toString()}>
              {itemDuration} bulan
            </option>
          ))}
        </select>
      </div>

      {/* Daftar membership */}
      <div className="flex flex-1 flex-col">
        {loading ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
            <p className="text-sm text-zinc-500">
              Memuat data membership...
            </p>
          </div>
        ) : filteredPlans.length > 0 ? (
          <>
            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedPlans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => router.push(`/membership/${plan.id}`)}
                  className="group flex h-full min-w-0 flex-col self-stretch overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 text-left shadow-sm transition duration-200 hover:border-orange-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  {/* Header card */}
                  <div className="relative isolate w-full shrink-0 overflow-hidden bg-zinc-900 p-5 text-white">
                    <div className="pointer-events-none absolute -right-8 -top-10 -z-10 h-32 w-32 rounded-full bg-orange-500/20 blur-2xl" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-600 shadow-md shadow-orange-950/30">
                          <Dumbbell size={23} color="#FFFFFF" />
                        </div>

                        <div className="min-w-0">
                          <h2 className="break-words text-lg font-bold text-white">
                            {plan.name}
                          </h2>

                          <p className="mt-1 text-sm text-zinc-300">
                            Paket membership
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1 ${plan.is_active
                          ? "bg-green-100 text-green-700 ring-green-400"
                          : "bg-red-100 text-red-800 ring-red-300"
                          }`}
                      >
                        {plan.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <div className="mt-6">
                      <p className="break-words text-2xl font-extrabold tracking-tight text-white">
                        Rp{plan.price.toLocaleString("id-ID")}
                      </p>

                      <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-300">
                        <CalendarDays size={15} />
                        <span>{plan.duration} bulan</span>
                      </div>
                    </div>

                    <div className="mt-5 h-1 w-16 rounded-full bg-orange-500 transition-all duration-200 group-hover:w-24" />
                  </div>

                  {/* Isi card */}
                  <div className="flex w-full flex-1 flex-col p-5">
                    {/* Jumlah member */}
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Users
                          size={20}
                          color="#C2410C"
                          className="shrink-0"
                        />

                        <span className="text-sm font-medium text-zinc-700">
                          Jumlah member
                        </span>
                      </div>

                      <span className="shrink-0 text-sm font-bold text-orange-800">
                        {plan.memberCount} member
                      </span>
                    </div>

                    {/* Benefit */}
                    <div className="mt-6">
                      <h3 className="mb-4 text-sm font-bold text-zinc-900">
                        Benefit Paket
                      </h3>

                      {plan.benefits.length > 0 ? (
                        <>
                          <ul className="space-y-3">
                            {(expandedBenefits.includes(plan.id)
                              ? plan.benefits
                              : plan.benefits.slice(0, 3)
                            ).map((benefit, index) => (
                              <li
                                key={`${plan.id}-benefit-${index}`}
                                className="flex items-start gap-2.5"
                              >
                                <CheckCircle2
                                  size={19}
                                  color="#EA580C"
                                  className="mt-0.5 shrink-0"
                                />

                                <span className="break-words text-sm leading-5 text-zinc-700">
                                  {benefit}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {plan.benefits.length > 3 && (
                            <p className="mt-3 text-xs font-bold text-orange-700">
                              +{plan.benefits.length - 3} benefit lainnya
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm italic text-zinc-500">
                          Belum ada benefit yang ditambahkan.
                        </p>
                      )}
                    </div>

                    {/* Tautan detail */}
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-200 pt-5 mt-6">
                      <span className="text-xs font-medium text-zinc-500 transition group-hover:text-orange-700">
                        Lihat detail paket
                      </span>

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 transition group-hover:bg-orange-100">
                        <ArrowUpRight size={20} color="#EA580C" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-auto pt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredPlans.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
              <Dumbbell size={27} color="#EA580C" />
            </div>

            <h2 className="mt-4 font-semibold text-zinc-900">
              {search || durationFilter !== "all"
                ? "Paket membership tidak ditemukan"
                : "Belum ada paket membership"}
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              {search || durationFilter !== "all"
                ? "Coba ubah kata kunci atau filter durasi."
                : "Tambahkan paket membership pertama untuk cabang ini."}
            </p>
          </div>
        )}
      </div>

      {/* Modal tambah membership */}
      <AddMembershipModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        name={name}
        duration={duration}
        price={price}
        benefits={benefits}
        saving={saving}
        onNameChange={setName}
        onDurationChange={setDuration}
        onPriceChange={setPrice}
        onBenefitsChange={setBenefits}
        onSubmit={handleAddMembership}
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
    </main >
  );
}
export default function MembershipPage() {
  return (
    <Suspense fallback={<div className="p-6">Memuat membership...</div>}>
      <MembershipContent />
    </Suspense>
  );
}