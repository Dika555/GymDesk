"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import Select from "react-select";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { logActivity } from "@/lib/activity-log";

type Member = {
  id: string;
  name: string;
  phone: string;
};

type Props = {
  onSuccess: () => void;
};

export default function AddVisitForm({ onSuccess }: Props) {
  const [visitType, setVisitType] = useState<"member" | "non-member">(
    "member"
  );

  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState("");
  const [memberHasActiveMembership, setMemberHasActiveMembership] =
    useState(false);
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [visitFee, setVisitFee] = useState("35000");
  const [notes, setNotes] = useState("");
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

  useEffect(() => {
    async function getMembers() {
      const supabase = createClient();

      const branchId = getActiveBranchId();

      if (!branchId) {
        setMembers([]);
        return;
      }

      const { data, error } = await supabase
        .from("members")
        .select("id, name, phone")
        .eq("branch_id", branchId)
        .order("name");

      if (error) {
        console.error("Gagal memuat data kunjungan.");
        return;
      }

      setMembers(data ?? []);
    }

    getMembers();
  }, []);

  async function checkMembership(memberId: string, date: string) {
    if (!memberId || !date) {
      setMemberHasActiveMembership(false);
      return;
    }

    setCheckingMembership(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("memberships")
      .select("id")
      .eq("member_id", memberId)
      .eq("status", "active")
      .lte("start_date", date)
      .gte("end_date", date)
      .limit(1);

    if (error) {
      console.error("Gagal mengambil data member.");
      setMemberHasActiveMembership(false);
    } else {
      setMemberHasActiveMembership((data ?? []).length > 0);
    }

    setCheckingMembership(false);
  }

  function handleTypeChange(type: "member" | "non-member") {
    setVisitType(type);
    setMemberId("");
    setVisitorName("");
    setPaymentMethod("");
    setVisitFee("35000");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!visitDate) {
      showFeedback(
        "Tanggal Belum Dipilih",
        "Pilih tanggal kunjungan terlebih dahulu.",
        "warning"
      );
      return;
    }

    if (visitType === "member" && !memberId) {
      showFeedback(
        "Member Belum Dipilih",
        "Pilih member yang akan dicatat kunjungannya.",
        "warning"
      );
      return;
    }

    if (visitType === "member" && !memberHasActiveMembership) {
      showFeedback(
        "Membership Tidak Aktif",
        "Member tidak memiliki membership aktif pada tanggal kunjungan tersebut.",
        "warning"
      );
      return;
    }

    if (visitType === "non-member" && !visitorName.trim()) {
      showFeedback(
        "Nama Belum Diisi",
        "Masukkan nama pengunjung.",
        "warning"
      );
      return;
    }

    if (visitType === "non-member" && !paymentMethod) {
      showFeedback(
        "Pembayaran Belum Dipilih",
        "Pilih metode pembayaran terlebih dahulu.",
        "warning"
      );
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const branchId = await getActiveBranchId();

      if (!branchId) {
        showFeedback(
          "Cabang Belum Dipilih",
          "Cabang aktif belum ditemukan. Periksa pilihan cabang terlebih dahulu.",
          "error"
        );
        return;
      }


      const { error } = await supabase.rpc("create_visit", {
        p_branch_id: branchId,
        p_member_id: visitType === "member" ? memberId : null,
        p_visitor_name:
          visitType === "member" ? "" : visitorName.trim(),
        p_visit_date: visitDate,
        p_payment_method:
          visitType === "member" ? null : paymentMethod,
        p_visit_fee:
          visitType === "member" ? 0 : Number(visitFee),
        p_notes: notes.trim() || null,
      });


      if (error) {
        console.error("Gagal mencatat kunjungan:", error);

        showFeedback(
          "Gagal Mencatat Kunjungan",
          "Kunjungan gagal dicatat. Silakan periksa data dan coba kembali.",
          "error"
        );
        return;
      }

      console.log("1. Mulai mencatat log kunjungan", {
        branchId,
        visitType,
      });

      await logActivity({
        action: "CREATE",
        description:
          visitType === "member"
            ? `Mencatat kunjungan member: ${members.find((member) => member.id === memberId)?.name ?? "Member"
            }`
            : `Mencatat kunjungan non-member: ${visitorName.trim()}`,
        branchId,
      });

      console.log("2. Fungsi logActivity selesai");

      setMemberId("");
      setVisitorName("");
      setVisitDate("");
      setPaymentMethod("");
      setNotes("");
      setMemberHasActiveMembership(false);

      onSuccess();
    } catch (error) {
      console.error("Terjadi kesalahan:", error);

      showFeedback(
        "Terjadi Kesalahan",
        "Terjadi kesalahan saat mencatat kunjungan. Silakan coba kembali.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form
        id="add-visit-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Tipe Pengunjung
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange("member")}
              className={`rounded-lg border px-4 py-2 ${visitType === "member"
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-gray-300"
                }`}
            >
              Member
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("non-member")}
              className={`rounded-lg border px-4 py-2 ${visitType === "non-member"
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-gray-300"
                }`}
            >
              Non-member
            </button>
          </div>
        </div>

        {/* Member */}
        {visitType === "member" ? (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Member
            </label>

            <Select
              options={members.map((m) => ({
                value: m.id,
                label: `${m.name} — ${m.phone || "-"}`,
              }))}
              value={members
                .map((m) => ({
                  value: m.id,
                  label: `${m.name} — ${m.phone || "-"}`,
                }))
                .find((m) => m.value === memberId) ?? null}
              onChange={(option) => {
                const id = option?.value ?? "";
                setMemberId(id);
                checkMembership(id, visitDate);
              }}
              placeholder="Cari nama atau nomor telepon..."
              isSearchable
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

            <p className="mt-2 text-sm text-gray-500">
              Member dengan membership aktif tidak dikenakan biaya kunjungan.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Nama Pengunjung
              </label>

              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Masukkan nama pengunjung"
                className="w-full rounded-lg border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Biaya Kunjungan (Rp)
              </label>

              <input
                type="number"
                min="0"
                step="1000"
                value={visitFee}
                onChange={(e) => setVisitFee(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Metode Pembayaran
              </label>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">
                  Pilih metode pembayaran
                </option>
                <option value="cash">Cash</option>
                <option value="qris">QRIS</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </>
        )}

        {visitType === "member" && (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Biaya Kunjungan
            </label>

            <input
              type="text"
              value={
                checkingMembership
                  ? "Memeriksa..."
                  : !memberId
                    ? "Pilih member"
                    : !visitDate
                      ? "Pilih tanggal kunjungan"
                      : memberHasActiveMembership
                        ? "Rp 0"
                        : "Tidak memiliki membership aktif"
              }
              readOnly
              className="w-full rounded-lg border bg-gray-100 px-3 py-2"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Tanggal Kunjungan
          </label>

          <input
            type="date"
            value={visitDate}
            onChange={(e) => {
              const date = e.target.value;
              setVisitDate(date);

              if (memberId) {
                checkMembership(memberId, date);
              }
            }}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Catatan Kunjungan
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Kunjungan tanggal..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <p className="mt-1 text-xs text-gray-500">
            Opsional. Catatan ini akan disimpan pada transaksi kunjungan non-member.
          </p>
        </div>
      </form>

      <FeedbackModal
        open={feedback.open}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
        onClose={() =>
          setFeedback((prev) => ({ ...prev, open: false }))
        }
      />
    </>
  );
}