"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import AddProductTransactionForm from "@/components/AddProductTransactionForm";
import Select from "react-select";
import FeedbackModal from "@/components/FeedbackModal";

type Member = {
  id: string;
  name: string;
};

type MembershipPlan = {
  id: string;
  name: string;
  duration: number;
  price: number;
  is_active: boolean;
};

type FeedbackType = "success" | "error" | "warning" | "info";

type Props = {
  onSuccess: () => void;
  showBodySubmit: boolean;
};

export default function AddTransactionForm({
  onSuccess,
  showBodySubmit,
}: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>(
    [],
  );

  const [transactionType, setTransactionType] = useState("membership");
  const [memberId, setMemberId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // State untuk notifikasi
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

  // Mengambil data member dan paket membership
  useEffect(() => {
    async function getData() {
      const branchId = getActiveBranchId();

      if (!branchId) {
        setMembers([]);
        setMembershipPlans([]);
        return;
      }

      const supabase = createClient();

      const [
        { data: membersData, error: membersError },
        { data: plansData, error: plansError },
      ] = await Promise.all([
        supabase
          .from("members")
          .select("id, name")
          .eq("branch_id", branchId)
          .order("name", { ascending: true }),

        supabase
          .from("membership_plans")
          .select("id, name, duration, price, is_active")
          .eq("branch_id", branchId)
          .eq("is_active", true)
          .order("price", { ascending: true }),
      ]);

      if (membersError) {
        console.error("Gagal mengambil member:", membersError);
      } else {
        setMembers(membersData ?? []);
      }

      if (plansError) {
        console.error("Gagal mengambil paket membership:", plansError);
      } else {
        setMembershipPlans(plansData ?? []);
      }
    }

    void getData();
  }, []);

  // Mengganti jenis transaksi dan mereset data formulir
  function handleTransactionTypeChange(value: string) {
    setTransactionType(value);

    setMemberId("");
    setCustomerName("");
    setPlanId("");
    setStartDate("");
    setTotalAmount("");
    setNotes("");
  }

  // Mengisi total berdasarkan harga paket yang dipilih
  function handlePlanChange(value: string) {
    setPlanId(value);

    const selectedPlan = membershipPlans.find(
      (plan) => plan.id === value,
    );

    setTotalAmount(
      selectedPlan ? String(selectedPlan.price) : "",
    );
  }

  // Menyimpan transaksi membership atau transaksi lainnya
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const amount = Number(totalAmount);

    if (
      !totalAmount ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      showFeedback(
        "Total Tidak Valid",
        "Total transaksi harus berupa angka lebih dari 0.",
        "warning",
      );
      return;
    }

    if (transactionType === "membership") {
      if (!memberId) {
        showFeedback(
          "Member Belum Dipilih",
          "Silakan pilih member terlebih dahulu.",
          "warning",
        );
        return;
      }

      if (!planId) {
        showFeedback(
          "Paket Belum Dipilih",
          "Silakan pilih paket membership terlebih dahulu.",
          "warning",
        );
        return;
      }

      if (!startDate) {
        showFeedback(
          "Tanggal Belum Dipilih",
          "Silakan pilih tanggal mulai membership.",
          "warning",
        );
        return;
      }
    }

    if (
      transactionType === "other" &&
      !customerName.trim()
    ) {
      showFeedback(
        "Nama Pelanggan Belum Diisi",
        "Silakan masukkan nama pelanggan.",
        "warning",
      );
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const branchId = getActiveBranchId();

      if (!branchId) {
        showFeedback(
          "Cabang Belum Dipilih",
          "Cabang aktif belum ditemukan. Periksa pilihan cabang terlebih dahulu.",
          "error",
        );
        return;
      }

      const transactionNote =
        transactionType === "membership"
          ? `Pembayaran membership${notes.trim() ? ` - ${notes.trim()}` : ""
          }`
          : notes.trim() || null;

      let error;

      if (transactionType === "membership") {
        const { error: rpcError } = await supabase.rpc(
          "create_membership_transaction",
          {
            p_branch_id: branchId,
            p_member_id: memberId,
            p_plan_id: planId,
            p_start_date: startDate,
            p_payment_method: paymentMethod,
            p_notes: transactionNote,
          },
        );

        error = rpcError;
      } else {
        const { error: insertError } = await supabase
          .from("transactions")
          .insert({
            branch_id: branchId,
            member_id: null,
            customer_name: customerName.trim(),
            transaction_type: "other",
            payment_method: paymentMethod,
            total_amount: amount,
            status: "completed",
            notes: transactionNote,
          });

        error = insertError;
      }

      if (error) {
        console.error(
          "Gagal menyimpan transaksi:",
          error,
        );

        showFeedback(
          "Gagal Menyimpan Transaksi",
          "Transaksi gagal disimpan. Silakan periksa data dan coba kembali.",
          "error",
        );
        return;
      }

      // Reset formulir setelah berhasil
      setTransactionType("membership");
      setMemberId("");
      setCustomerName("");
      setPlanId("");
      setStartDate("");
      setPaymentMethod("cash");
      setTotalAmount("");
      setNotes("");

      // Notifikasi sukses ditampilkan oleh halaman transaksi
      onSuccess();
    } catch (error) {
      console.error("Terjadi kesalahan:", error);

      showFeedback(
        "Terjadi Kesalahan",
        "Terjadi kesalahan saat menyimpan transaksi.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  // Tampilan khusus transaksi produk
  if (transactionType === "product") {
    return (
      <>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Jenis Transaksi
            </label>

            <select
              value={transactionType}
              onChange={(e) =>
                handleTransactionTypeChange(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
            >
              <option value="membership">Membership</option>
              <option value="product">Produk</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          <AddProductTransactionForm
            onSuccess={onSuccess}
            showSubmitButton={showBodySubmit}
          />
        </div>

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

  return (
    <>
      <form
        id="add-transaction-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Jenis Transaksi */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Jenis Transaksi
          </label>

          <select
            value={transactionType}
            onChange={(e) =>
              handleTransactionTypeChange(e.target.value)
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          >
            <option value="membership">Membership</option>
            <option value="product">Produk</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        {/* Member — hanya untuk transaksi membership */}
        {transactionType === "membership" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Member
            </label>

            <Select
              options={[
                { value: "", label: "Cari member..." },
                ...members.map((member) => ({
                  value: member.id,
                  label: member.name,
                })),
              ]}
              value={
                [
                  { value: "", label: "Cari member..." },
                  ...members.map((member) => ({
                    value: member.id,
                    label: member.name,
                  })),
                ].find((member) => member.value === memberId) ?? null
              }
              onChange={(option) => setMemberId(option?.value ?? "")}
              placeholder="Cari member..."
              noOptionsMessage={() => "Member tidak ditemukan"}
            />

            <p className="mt-1 text-xs text-zinc-500">
              Pembayaran membership harus dikaitkan dengan member.
            </p>
          </div>
        )}

        {/* Nama Pelanggan */}
        {transactionType === "other" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Nama Pelanggan
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              placeholder="Masukkan nama pelanggan"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
            />

            <p className="mt-1 text-xs text-zinc-500">
              Isi jika transaksi dilakukan oleh non-member.
            </p>
          </div>
        )}

        {/* Detail Membership */}
        {transactionType === "membership" && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Paket Membership
              </label>

              <select
                value={planId}
                onChange={(e) =>
                  handlePlanChange(e.target.value)
                }
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
                required
              >
                <option value="">
                  Pilih paket membership
                </option>

                {membershipPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - Rp{" "}
                    {plan.price.toLocaleString("id-ID")} (
                    {plan.duration} bulan)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Tanggal Mulai
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
                required
              />
            </div>
          </>
        )}

        {/* Metode Pembayaran */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Metode Pembayaran
          </label>

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value)
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          >
            <option value="cash">Cash</option>
            <option value="qris">QRIS</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        {/* Total Transaksi */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Total Transaksi
          </label>

          <input
            type="number"
            min="1"
            value={totalAmount}
            readOnly={transactionType === "membership"}
            onChange={(e) =>
              setTotalAmount(e.target.value)
            }
            placeholder="Contoh: 50000"
            className={`w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500 ${transactionType === "membership"
              ? "bg-zinc-100 text-zinc-600"
              : ""
              }`}
            required
          />
        </div>

        {/* Catatan */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Catatan
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opsional"
            rows={3}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          />
        </div>

        {/* Tombol submit untuk penggunaan form mandiri */}
        {showBodySubmit && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        )}
      </form >

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