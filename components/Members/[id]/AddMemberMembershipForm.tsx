"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Select from "react-select";

type Plan = {
  id: string;
  name: string;
  duration: number;
  price: number;
  is_active: boolean;
};

type FeedbackType = "success" | "error" | "warning" | "info";

type Props = {
  memberId: string;
  branchId: string;
  onSuccess: () => void;
  onFeedback: (
    title: string,
    message: string,
    type: FeedbackType
  ) => void;
  onSavingChange: (saving: boolean) => void;
};

export default function AddMemberMembershipForm({
  memberId,
  branchId,
  onSuccess,
  onFeedback,
  onSavingChange,
}: Props) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getPlans() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("membership_plans")
        .select("id, name, duration, price, is_active")
        .eq("branch_id", branchId)
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) {
        console.error("Gagal mengambil paket membership:", error);

        onFeedback(
          "Gagal Memuat Paket",
          "Daftar paket membership gagal dimuat. Silakan coba lagi.",
          "error"
        );
        return;
      }

      setPlans(data ?? []);
    }

    if (branchId) {
      getPlans();
    }
  }, [branchId, onFeedback]);

  const selectedPlan = plans.find((plan) => plan.id === planId);

  function calculateEndDate() {
    if (!selectedPlan || !startDate) {
      return "";
    }

    const [year, month, day] = startDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    date.setMonth(date.getMonth() + selectedPlan.duration);

    const resultYear = date.getFullYear();
    const resultMonth = String(date.getMonth() + 1).padStart(2, "0");
    const resultDay = String(date.getDate()).padStart(2, "0");

    return `${resultYear}-${resultMonth}-${resultDay}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (saving) return;

    if (!planId || !startDate) {
      onFeedback(
        "Data Belum Lengkap",
        "Pilih paket dan tanggal mulai terlebih dahulu.",
        "warning"
      );
      return;
    }

    setSaving(true);
    onSavingChange(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc(
        "create_membership_transaction",
        {
          p_branch_id: branchId,
          p_member_id: memberId,
          p_plan_id: planId,
          p_start_date: startDate,
          p_payment_method: paymentMethod,
          p_notes: notes.trim() || null,
        }
      );

      if (error) {
        console.error("Gagal menambahkan membership:", error);

        onFeedback(
          "Gagal Menambahkan Membership",
          error.message || "Membership gagal ditambahkan. Silakan coba lagi.",
          "error"
        );
        return;
      }

      setPlanId("");
      setStartDate("");
      setPaymentMethod("cash");
      setNotes("");

      onSuccess();
    } catch (error) {
      console.error("Terjadi kesalahan:", error);

      onFeedback(
        "Terjadi Kesalahan",
        "Terjadi kesalahan saat menambahkan membership. Silakan coba lagi.",
        "error"
      );
    } finally {
      setSaving(false);
      onSavingChange(false);
    }
  }

  return (
    <form
      id="member-membership-form"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Paket Membership
        </label>

        <Select
          options={plans.map((plan) => ({
            value: plan.id,
            label: `${plan.name} — Rp ${plan.price.toLocaleString("id-ID")} (${plan.duration} bulan)`,
          }))}
          value={
            plans
              .map((plan) => ({
                value: plan.id,
                label: `${plan.name} — Rp ${plan.price.toLocaleString("id-ID")} (${plan.duration} bulan)`,
              }))
              .find((plan) => plan.value === planId) ?? null
          }
          onChange={(option) => setPlanId(option?.value ?? "")}
          placeholder="Cari paket membership..."
          isSearchable
          isDisabled={saving}
          styles={{
            control: (base) => ({
              ...base,
              minHeight: "42px",
              borderRadius: "8px",
              borderColor: "#d4d4d8",
              boxShadow: "none",
            }),
          }}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Tanggal Mulai
        </label>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={saving}
          className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Tanggal Berakhir
        </label>

        <input
          type="date"
          value={calculateEndDate()}
          readOnly
          className="w-full rounded-lg border bg-gray-100 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Metode Pembayaran
        </label>

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          disabled={saving}
          className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
        >
          <option value="cash">Cash</option>
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Total Pembayaran
        </label>

        <input
          type="text"
          value={
            selectedPlan
              ? `Rp ${selectedPlan.price.toLocaleString("id-ID")}`
              : ""
          }
          readOnly
          placeholder="Pilih paket terlebih dahulu"
          className="w-full rounded-lg border bg-gray-100 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Catatan
        </label>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Opsional"
          rows={3}
          disabled={saving}
          className="w-full rounded-lg border px-3 py-2 disabled:bg-zinc-100"
        />
      </div>
    </form>
  );
}