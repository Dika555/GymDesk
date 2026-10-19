
"use client";

import type { FormEvent } from "react";

type Branch = {
  id: string;
  name: string;
};

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
  branch_id: string | null;
  is_active: boolean;
};

type Props = {
  editingAdmin: Admin | null;
  branches: Branch[];
  name: string;
  email: string;
  branchId: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function AdminForm({
  editingAdmin,
  branches,
  name,
  email,
  branchId,
  onNameChange,
  onEmailChange,
  onBranchChange,
  onSubmit,
}: Props) {
  return (
    <form
      id="admin-form"
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Nama Admin
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Contoh: Budi"
          minLength={2}
          maxLength={100}
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-orange-500"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Email Gmail
        </label>

        {editingAdmin ? (
          <>
            <div className="w-full break-all rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-zinc-500">
              {email || "-"}
            </div>

            <p className="mt-1.5 text-xs text-zinc-500">
              Email tidak dapat diubah setelah akun Admin dibuat.
            </p>
          </>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="admin@gmail.com"
              maxLength={254}
              pattern="[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com"
              title="Gunakan alamat email yang berakhiran @gmail.com"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-orange-500"
              required
            />

            <p className="mt-1.5 text-xs text-zinc-500">
              Gunakan Gmail yang aktif dan bisa dibuka oleh Admin.
              Tautan undangan akan dikirim ke alamat ini.
            </p>
          </>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Cabang
        </label>

        <select
          value={branchId}
          onChange={(e) => onBranchChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:border-orange-500"
          required
        >
          <option value="">Pilih cabang</option>

          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {!editingAdmin && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
          <p className="font-medium">
            Password dibuat oleh Admin
          </p>
          <p className="mt-1">
            Setelah menerima undangan, Admin membuka email dan
            mengikuti petunjuk untuk mengaktifkan akun serta
            membuat password sendiri.
          </p>
        </div>
      )}
    </form>
  );
}
