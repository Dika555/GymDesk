"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminModal from "@/components/admins/AdminModal";
import Search from "@/components/ui/Search";
import Pagination from "@/components/ui/Pagination";
import FeedbackModal from "@/components/ui/FeedbackModal";
import Modal from "@/components/ui/Modal";
import {
  ShieldCheck,
  Pencil,
  Power,
  PowerOff,
  CircleAlert,
} from "lucide-react";

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
  branch_id: string | null;
  is_active: boolean;
};

type Branch = {
  id: string;
  name: string;
};

type FeedbackType = "success" | "error" | "warning" | "info";

type Feedback = {
  open: boolean;
  title: string;
  message: string;
  type: FeedbackType;
};

export default function AdminsPage() {
  const supabase = createClient();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [changingStatus, setChangingStatus] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branchId, setBranchId] = useState("");

  const [confirmAdmin, setConfirmAdmin] = useState<Admin | null>(null);
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

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      // Periksa user yang sedang login.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("User belum login:", authError);
        setAuthorized(false);
        return;
      }

      // Periksa role user.
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("Gagal mengambil profile:", profileError);
        setAuthorized(false);
        return;
      }

      if (profile.role !== "super_admin") {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);

      // Ambil data admin.
      const { data: adminData, error: adminError } = await supabase
        .from("users")
        .select("id, name, email, role, branch_id, is_active")
        .eq("role", "admin")
        .order("name");

      if (adminError) {
        console.error("Gagal mengambil admin:", adminError);
        showFeedback(
          "Gagal Memuat Admin",
          "Data admin tidak dapat dimuat. Silakan coba lagi.",
          "error"
        );
        return;
      }

      // Ambil data cabang.
      const { data: branchData, error: branchError } = await supabase
        .from("branches")
        .select("id, name")
        .order("name");

      if (branchError) {
        console.error("Gagal mengambil cabang:", branchError);
        showFeedback(
          "Gagal Memuat Cabang",
          "Data cabang tidak dapat dimuat dengan benar.",
          "error"
        );
        return;
      }

      setAdmins(adminData ?? []);
      setBranches(branchData ?? []);
    } catch (error) {
      console.error("Terjadi kesalahan saat memuat data:", error);
      showFeedback(
        "Terjadi Kesalahan",
        "Data admin gagal dimuat. Periksa koneksi lalu coba lagi.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function openAddForm() {
    setEditingAdmin(null);
    setName("");
    setEmail("");
    setPassword("");
    setBranchId("");
    setShowForm(true);
  }

  function openEditForm(admin: Admin) {
    setEditingAdmin(admin);
    setName(admin.name);
    setEmail(admin.email);
    setPassword("");
    setBranchId(admin.branch_id ?? "");
    setShowForm(true);
  }

  function closeForm() {
    if (savingAdmin) return;

    setShowForm(false);
    setEditingAdmin(null);
    setName("");
    setEmail("");
    setPassword("");
    setBranchId("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (savingAdmin) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Validasi data
    if (
      !trimmedName ||
      !branchId ||
      (!editingAdmin && !trimmedEmail)
    ) {
      showFeedback(
        "Data Belum Lengkap",
        "Nama dan cabang wajib diisi. Email diperlukan untuk membuat admin baru.",
        "warning"
      );
      return;
    }

    // Validasi password untuk admin baru
    if (!editingAdmin && password.length < 6) {
      showFeedback(
        "Password Tidak Valid",
        "Password awal minimal 6 karakter.",
        "warning"
      );
      return;
    }

    setSavingAdmin(true);

    try {
      if (editingAdmin) {
        // Edit admin: email tidak ikut diperbarui.
        const { error } = await supabase
          .from("users")
          .update({
            name: trimmedName,
            branch_id: branchId,
          })
          .eq("id", editingAdmin.id)
          .eq("role", "admin");

        if (error) {
          console.error("Gagal memperbarui admin:", error);

          showFeedback(
            "Gagal Memperbarui Admin",
            error.message,
            "error"
          );
          return;
        }

        closeFormAfterSave();

        showFeedback(
          "Admin Berhasil Diperbarui",
          `Data admin "${trimmedName}" berhasil diperbarui.`,
          "success"
        );
      } else {
        // Tambah admin: email tetap digunakan untuk membuat akun.
        const response = await fetch("/api/admins", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password,
            branch_id: branchId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          showFeedback(
            "Gagal Membuat Admin",
            result.error || "Akun admin gagal dibuat.",
            "error"
          );
          return;
        }

        closeFormAfterSave();

        showFeedback(
          "Admin Berhasil Dibuat",
          `Akun admin "${trimmedName}" berhasil dibuat.`,
          "success"
        );
      }

      await loadData();
    } catch (error) {
      console.error(
        "Terjadi kesalahan saat menyimpan admin:",
        error
      );

      showFeedback(
        "Terjadi Kesalahan",
        "Admin gagal disimpan. Periksa koneksi lalu coba lagi.",
        "error"
      );
    } finally {
      setSavingAdmin(false);
    }
  }

  function closeFormAfterSave() {
    setShowForm(false);
    setEditingAdmin(null);
    setName("");
    setEmail("");
    setPassword("");
    setBranchId("");
  }

  function getBranchName(id: string | null) {
    if (!id) return "-";

    return branches.find((branch) => branch.id === id)?.name ?? "-";
  }

  async function handleToggleStatus() {
    if (!confirmAdmin || changingStatus) return;

    const admin = confirmAdmin;
    const newStatus = !admin.is_active;

    setChangingStatus(admin.id);

    try {
      const { error } = await supabase
        .from("users")
        .update({ is_active: newStatus })
        .eq("id", admin.id)
        .eq("role", "admin");

      if (error) {
        console.error("Gagal mengubah status admin:", error);
        setConfirmAdmin(null);
        showFeedback(
          "Gagal Mengubah Status",
          error.message,
          "error"
        );
        return;
      }

      setConfirmAdmin(null);

      showFeedback(
        newStatus ? "Admin Diaktifkan" : "Admin Dinonaktifkan",
        `Akun admin "${admin.name}" berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"
        }.`,
        "success"
      );

      await loadData();
    } catch (error) {
      console.error("Terjadi kesalahan saat mengubah status:", error);
      setConfirmAdmin(null);
      showFeedback(
        "Terjadi Kesalahan",
        "Status admin gagal diubah. Silakan coba lagi.",
        "error"
      );
    } finally {
      setChangingStatus(null);
    }
  }

  const filteredAdmins = admins.filter((admin) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      admin.name.toLowerCase().includes(keyword) ||
      admin.email.toLowerCase().includes(keyword) ||
      getBranchName(admin.branch_id).toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && admin.is_active) ||
      (statusFilter === "inactive" && !admin.is_active);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE);

  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 sm:p-8">
      {/* Header halaman */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <ShieldCheck size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Kelola Admin
            </h1>
            <p className="mt-1 text-sm text-zinc-500 sm:text-base">
              Kelola akun admin dan cabang yang dikelola.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          disabled={!authorized || loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShieldCheck size={18} />+
          Tambah Admin
        </button>
      </div>

      {!loading && !authorized ? (
        <section className="rounded-xl border border-red-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 shrink-0 text-red-600" size={22} />
            <div>
              <h2 className="font-semibold text-zinc-900">
                Akses Ditolak
              </h2>
              <p className="mt-1 text-sm text-red-600">
                Halaman ini hanya dapat diakses oleh Super Admin.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {showForm && (
            <AdminModal
              editingAdmin={editingAdmin}
              branches={branches}
              name={name}
              email={email}
              password={password}
              branchId={branchId}
              onNameChange={setName}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onBranchChange={setBranchId}
              onSubmit={handleSubmit}
              onClose={closeForm}
            />
          )}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Search
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama, email, atau cabang..."
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {loading ? (
              <div className="p-6 text-sm text-zinc-500">
                Memuat data admin...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="border-b-2 border-zinc-200 bg-zinc-100">
                      {[
                        "No",
                        "Nama",
                        "Email",
                        "Cabang",
                        "Role",
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
                    {filteredAdmins.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-sm text-zinc-500"
                        >
                          {search || statusFilter !== "all"
                            ? "Admin tidak ditemukan."
                            : "Belum ada data admin."}
                        </td>
                      </tr>
                    ) : (
                      paginatedAdmins.map((admin, index) => (
                        <tr
                          key={admin.id}
                          className="transition-colors hover:bg-zinc-50"
                        >
                          <td className="px-4 py-4 text-sm text-zinc-500">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-zinc-900">
                            {admin.name}
                          </td>

                          <td className="px-4 py-4 text-sm text-zinc-600">
                            {admin.email}
                          </td>

                          <td className="px-4 py-4 text-sm text-zinc-600">
                            {getBranchName(admin.branch_id)}
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                              Admin
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${admin.is_active
                                ? "bg-green-50 text-green-700 ring-green-200"
                                : "bg-red-50 text-red-700 ring-red-200"
                                }`}
                            >
                              {admin.is_active ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex justify-start gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(admin)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmAdmin(admin)}
                                disabled={changingStatus !== null}
                                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${admin.is_active
                                  ? "border-red-200 text-red-600 hover:bg-red-50"
                                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                  }`}
                              >
                                {admin.is_active ? (
                                  <PowerOff size={14} />
                                ) : (
                                  <Power size={14} />
                                )}
                                {admin.is_active ? "Nonaktifkan" : "Aktifkan"}
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
              totalItems={filteredAdmins.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Konfirmasi status admin */}
      {confirmAdmin && (
        <Modal
          title={
            confirmAdmin.is_active
              ? "Nonaktifkan Admin"
              : "Aktifkan Admin"
          }
          onClose={() => {
            if (!changingStatus) setConfirmAdmin(null);
          }}
          maxWidth="max-w-md"
          footer={
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmAdmin(null)}
                disabled={changingStatus !== null}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => void handleToggleStatus()}
                disabled={changingStatus !== null}
                className={`flex-1 rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50 ${confirmAdmin.is_active
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
              >
                {changingStatus
                  ? "Memproses..."
                  : confirmAdmin.is_active
                    ? "Ya, Nonaktifkan"
                    : "Ya, Aktifkan"}
              </button>
            </div>
          }
        >
          <p className="text-sm leading-6 text-zinc-600">
            Apakah kamu yakin ingin{" "}
            <span className="font-semibold">
              {confirmAdmin.is_active ? "menonaktifkan" : "mengaktifkan"}
            </span>{" "}
            akun admin{" "}
            <span className="font-semibold text-zinc-900">
              &quot;{confirmAdmin.name}&quot;
            </span>
            ?
          </p>
          {confirmAdmin.is_active && (
            <p className="mt-3 text-sm leading-6 text-amber-700">
              Pastikan admin tersebut memang perlu dinonaktifkan sebelum
              melanjutkan.
            </p>
          )}
        </Modal>
      )}

      {/* Notifikasi */}
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