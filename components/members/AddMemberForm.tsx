"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import { logActivity } from "@/lib/activity-log";

type Member = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  address: string | null;
  membership: string | null;
};

type FeedbackType = "success" | "error" | "warning" | "info";

type Props = {
  onSuccess: () => void;
  onFeedback: (
    title: string,
    message: string,
    type: FeedbackType
  ) => void;
  member?: Member;
};

export default function AddMemberForm({
  onSuccess,
  onFeedback,
  member,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  const [registrationFee, setRegistrationFee] = useState("50000");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(member);

  useEffect(() => {
    if (member) {
      setName(member.name ?? "");
      setPhone(member.phone ?? "");
      setEmail(member.email ?? "");
      setGender(member.gender ?? "");
      setAddress(member.address ?? "");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setGender("");
      setAddress("");
      setRegistrationFee("50000");
      setPaymentMethod("cash");
    }
  }, [member]);


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      onFeedback("Data Belum Lengkap", "Nama member wajib diisi.", "warning");
      return;
    }

    if (!phone.trim()) {
      onFeedback("Data Belum Lengkap", "Nomor HP wajib diisi.", "warning");
      return;
    }

    if (!isEditing && (!registrationFee || Number(registrationFee) < 0)) {
      onFeedback("Biaya Tidak Valid", "Biaya pendaftaran harus berupa angka nol atau lebih.", "warning");
      return;
    }

    const branchId = getActiveBranchId();

    if (!branchId) {
      onFeedback("Cabang Belum Dipilih", "Silakan pilih cabang aktif terlebih dahulu.", "warning");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const cleanPhone = phone.trim();

      // Proses edit member
      if (isEditing && member) {
        const { data: existingMember, error: checkError } = await supabase
          .from("members")
          .select("id")
          .eq("branch_id", branchId)
          .eq("phone", cleanPhone)
          .neq("id", member.id)
          .maybeSingle();

        if (checkError) {
          onFeedback("Gagal Memeriksa Nomor HP", "Silakan coba lagi.", "error");
          return;
        }

        if (existingMember) {
          onFeedback(
            "Nomor HP Sudah Digunakan",
            "Nomor HP ini sudah dipakai member lain di cabang ini.",
            "warning"
          );
          return;
        }

        const changes: string[] = [];

        if (member.name !== name.trim()) {
          changes.push(`Nama: "${member.name}" → "${name.trim()}"`);
        }

        if ((member.phone ?? "") !== cleanPhone) {
          changes.push(`No. HP: "${member.phone ?? "-"}" → "${cleanPhone}"`);
        }

        if ((member.email ?? "") !== (email.trim() || "")) {
          changes.push(`Email: "${member.email ?? "-"}" → "${email.trim() || "-"}"`);
        }

        if ((member.gender ?? "") !== (gender || "")) {
          changes.push(`Jenis kelamin: "${member.gender ?? "-"}" → "${gender || "-"}"`);
        }

        if ((member.address ?? "") !== (address.trim() || "")) {
          changes.push(`Alamat: "${member.address ?? "-"}" → "${address.trim() || "-"}"`);
        }

        const { error } = await supabase
          .from("members")
          .update({
            name: name.trim(),
            phone: cleanPhone,
            email: email.trim() || null,
            gender: gender || null,
            address: address.trim() || null,
          })
          .eq("id", member.id)
          .eq("branch_id", branchId);

        if (error) {
          const duplicate = error.code === "23505";
          onFeedback(
            duplicate ? "Nomor HP Sudah Digunakan" : "Gagal Menyimpan",
            duplicate
              ? "Nomor HP ini sudah dipakai member lain di cabang ini."
              : "Data member gagal diubah. Silakan coba lagi.",
            duplicate ? "warning" : "error"
          );
          return;
        }

        if (changes.length > 0) {
          await logActivity({
            action: "UPDATE",
            description: `Mengubah data member "${name.trim()}": ${changes.join("; ")}`,
            branchId,
          });
        }

        onSuccess();
        return;
      }

      // Proses tambah member
      const { error } = await supabase.rpc("create_member_registration", {
        p_branch_id: branchId,
        p_name: name.trim(),
        p_phone: cleanPhone,
        p_email: email.trim(),
        p_gender: gender,
        p_address: address.trim(),
        p_registration_fee: Number(registrationFee),
        p_payment_method: paymentMethod,
      });

      if (error) {
        const duplicate =
          error.message?.includes("Nomor HP sudah digunakan") ||
          error.code === "23505";

        onFeedback(
          duplicate ? "Nomor HP Sudah Digunakan" : "Gagal Mendaftarkan Member",
          duplicate
            ? "Nomor HP ini sudah dipakai member lain di cabang ini."
            : error.message || "Terjadi kesalahan saat mendaftarkan member.",
          duplicate ? "warning" : "error"
        );
        return;
      }

      await logActivity({
        action: "CREATE",
        description: `Menambahkan member: ${name.trim()}`,
        branchId,
      });

      onSuccess();

      onSuccess();
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      onFeedback(
        "Terjadi Kesalahan",
        "Terjadi kesalahan saat menyimpan data member. Silakan coba lagi.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form id="member-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Nama
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          No. HP
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="opsional"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Jenis Kelamin
        </label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        >
          <option value="">Pilih</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Alamat
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Alamat member"
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        />
      </div>

      {!isEditing && (
        <div className="border-t border-zinc-200 pt-4">
          <p className="mb-3 text-sm font-semibold text-zinc-800">
            Pendaftaran Member
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Biaya Pendaftaran
              </label>
              <input
                type="number"
                min="0"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
                required
              />
              <p className="mt-1 text-xs text-zinc-500">
                Nilai Rp50.000 sementara digunakan sebagai contoh.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
              >
                <option value="cash">Cash</option>
                <option value="qris">QRIS</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}