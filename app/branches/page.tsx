"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BranchModal from "@/components/branches/BranchModal";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import FeedbackModal from "@/components/FeedbackModal";
import Modal from "@/components/Modal";
import {
  Building2,
  Pencil,
  Power,
  PowerOff,
  CircleAlert,
} from "lucide-react";

type Branch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
};

type FeedbackType = "success" | "error" | "warning" | "info";

type Feedback = {
  open: boolean;
  title: string;
  message: string;
  type: FeedbackType;
};

export default function BranchesPage() {
  const supabase = createClient();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmBranch, setConfirmBranch] = useState<Branch | null>(null);

  const [feedback, setFeedback] = useState<Feedback>({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  function showFeedback(
    title: string,
    message: string,
    type: FeedbackType
  ) {
    setFeedback({
      open: true,
      title,
      message,
      type,
    });
  }

  const loadBranches = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Gagal memeriksa login:", authError);
        setAuthorized(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "super_admin") {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);

      const { data, error } = await supabase
        .from("branches")
        .select("id, name, address, phone, is_active")
        .order("name");

      if (error) {
        console.error("Gagal mengambil data cabang:", error);
        showFeedback(
          "Gagal Memuat Cabang",
          "Data cabang tidak dapat dimuat. Silakan coba lagi.",
          "error"
        );
        return;
      }

      setBranches(data ?? []);
    } catch (error) {
      console.error("Terjadi kesalahan saat memuat cabang:", error);
      showFeedback(
        "Terjadi Kesalahan",
        "Data cabang gagal dimuat. Periksa koneksi lalu coba lagi.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  function openAddForm() {
    setEditingId(null);
    setName("");
    setAddress("");
    setPhone("");
    setShowForm(true);
  }

  function openEditForm(branch: Branch) {
    setEditingId(branch.id);
    setName(branch.name);
    setAddress(branch.address ?? "");
    setPhone(branch.phone ?? "");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setName("");
    setAddress("");
    setPhone("");
  }

  function resetFormAfterSave() {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setAddress("");
    setPhone("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      showFeedback(
        "Nama Cabang Wajib Diisi",
        "Masukkan nama cabang sebelum menyimpan.",
        "warning"
      );
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("branches")
          .update({
            name: trimmedName,
            address: address.trim() || null,
            phone: phone.trim() || null,
          })
          .eq("id", editingId);

        if (error) {
          console.error("Gagal mengubah cabang:", error);
          showFeedback(
            "Gagal Mengubah Cabang",
            error.message,
            "error"
          );
          return;
        }

        resetFormAfterSave();

        showFeedback(
          "Cabang Berhasil Diubah",
          `Data cabang "${trimmedName}" berhasil diperbarui.`,
          "success"
        );
      } else {
        const { error } = await supabase
          .from("branches")
          .insert({
            name: trimmedName,
            address: address.trim() || null,
            phone: phone.trim() || null,
          });

        if (error) {
          console.error("Gagal menambahkan cabang:", error);
          showFeedback(
            "Gagal Menambahkan Cabang",
            error.message,
            "error"
          );
          return;
        }

        resetFormAfterSave();

        showFeedback(
          "Cabang Berhasil Ditambahkan",
          `Cabang "${trimmedName}" berhasil ditambahkan.`,
          "success"
        );
      }

      await loadBranches();
    } catch (error) {
      console.error("Terjadi kesalahan saat menyimpan cabang:", error);
      showFeedback(
        "Terjadi Kesalahan",
        "Cabang gagal disimpan. Periksa koneksi lalu coba lagi.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    if (!confirmBranch || changingStatus) return;

    const branch = confirmBranch;
    const newStatus = !branch.is_active;

    setChangingStatus(true);

    try {
      const { error } = await supabase
        .from("branches")
        .update({
          is_active: newStatus,
        })
        .eq("id", branch.id);

      if (error) {
        console.error("Gagal mengubah status cabang:", error);
        setConfirmBranch(null);

        showFeedback(
          "Gagal Mengubah Status Cabang",
          error.message,
          "error"
        );
        return;
      }

      setConfirmBranch(null);

      showFeedback(
        newStatus ? "Cabang Berhasil Diaktifkan" : "Cabang Berhasil Dinonaktifkan",
        `Cabang "${branch.name}" berhasil ${
          newStatus ? "diaktifkan" : "dinonaktifkan"
        }.`,
        "success"
      );

      await loadBranches();
    } catch (error) {
      console.error("Terjadi kesalahan saat mengubah status cabang:", error);
      setConfirmBranch(null);

      showFeedback(
        "Terjadi Kesalahan",
        "Status cabang gagal diubah. Silakan coba lagi.",
        "error"
      );
    } finally {
      setChangingStatus(false);
    }
  }

  const filteredBranches = branches.filter((branch) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      branch.name.toLowerCase().includes(keyword) ||
      (branch.address ?? "").toLowerCase().includes(keyword) ||
      (branch.phone ?? "").toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && branch.is_active) ||
      (statusFilter === "inactive" && !branch.is_active);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(
    filteredBranches.length / ITEMS_PER_PAGE
  );

  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-zinc-50 p-4 text-zinc-900 sm:p-6 lg:p-8">
      {authorized === null ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-zinc-500">Memeriksa akses...</p>
        </div>
      ) : authorized === false ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Akses Ditolak</h1>
            <p className="mt-2 text-zinc-500">
              Halaman ini hanya dapat diakses oleh Super Admin.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Header halaman */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Building2 size={26} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                  Kelola Cabang
                </h1>
                <p className="mt-1 text-sm text-zinc-500 sm:text-base">
                  Kelola daftar cabang gym yang terdaftar di GymDesk.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              disabled={loading || saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Building2 size={18} />
              Tambah Cabang
            </button>
          </div>

          {showForm && (
            <BranchModal
              editingId={editingId}
              name={name}
              address={address}
              phone={phone}
              onNameChange={setName}
              onAddressChange={setAddress}
              onPhoneChange={setPhone}
              onSubmit={handleSubmit}
              onClose={closeForm}
            />
          )}

          {/* Pencarian dan filter */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Search
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama, alamat, atau nomor telepon..."
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          {/* Tabel cabang */}
          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {loading ? (
              <div className="p-6 text-sm text-zinc-500">
                Memuat data cabang...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="border-b-2 border-zinc-200 bg-zinc-100">
                      {[
                        "No",
                        "Nama Cabang",
                        "Alamat",
                        "Telepon",
                        "Status",
                        "Aksi",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {filteredBranches.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-sm text-zinc-500"
                        >
                          {search || statusFilter !== "all"
                            ? "Cabang tidak ditemukan."
                            : "Belum ada data cabang."}
                        </td>
                      </tr>
                    ) : (
                      paginatedBranches.map((branch, index) => (
                        <tr
                          key={branch.id}
                          className="transition-colors hover:bg-zinc-50"
                        >
                          <td className="px-4 py-4 text-sm text-zinc-500">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-zinc-900">
                            {branch.name}
                          </td>

                          <td className="px-4 py-4 text-sm text-zinc-600">
                            {branch.address || "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                            {branch.phone || "-"}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                                branch.is_active
                                  ? "bg-green-50 text-green-700 ring-green-200"
                                  : "bg-red-50 text-red-700 ring-red-200"
                              }`}
                            >
                              {branch.is_active ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(branch)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmBranch(branch)}
                                disabled={changingStatus}
                                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                                  branch.is_active
                                    ? "border-red-200 text-red-600 hover:bg-red-50"
                                    : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                }`}
                              >
                                {branch.is_active ? (
                                  <PowerOff size={14} />
                                ) : (
                                  <Power size={14} />
                                )}
                                {branch.is_active ? "Nonaktifkan" : "Aktifkan"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {!loading && totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredBranches.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Konfirmasi aktivasi/nonaktivasi cabang */}
      {confirmBranch && (
        <Modal
          title={
            confirmBranch.is_active
              ? "Nonaktifkan Cabang"
              : "Aktifkan Cabang"
          }
          onClose={() => {
            if (!changingStatus) setConfirmBranch(null);
          }}
          maxWidth="max-w-md"
          footer={
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmBranch(null)}
                disabled={changingStatus}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => void handleToggleStatus()}
                disabled={changingStatus}
                className={`flex-1 rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50 ${
                  confirmBranch.is_active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {changingStatus
                  ? "Memproses..."
                  : confirmBranch.is_active
                    ? "Ya, Nonaktifkan"
                    : "Ya, Aktifkan"}
              </button>
            </div>
          }
        >
          <p className="text-sm leading-6 text-zinc-600">
            Apakah kamu yakin ingin{" "}
            <span className="font-semibold">
              {confirmBranch.is_active ? "menonaktifkan" : "mengaktifkan"}
            </span>{" "}
            cabang{" "}
            <span className="font-semibold text-zinc-900">
              &quot;{confirmBranch.name}&quot;
            </span>
            ?
          </p>

          {confirmBranch.is_active && (
            <p className="mt-3 text-sm leading-6 text-amber-700">
              Pastikan cabang tersebut memang perlu dinonaktifkan sebelum
              melanjutkan.
            </p>
          )}
        </Modal>
      )}

      {/* Notifikasi hasil aksi */}
      <FeedbackModal
        open={feedback.open}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
        onClose={() =>
          setFeedback((previous) => ({
            ...previous,
            open: false,
          }))
        }
      />
    </main>
  );
}