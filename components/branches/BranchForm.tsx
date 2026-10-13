"use client";

import type { FormEvent } from "react";

type Props = {
  name: string;
  address: string;
  phone: string;

  onNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onPhoneChange: (value: string) => void;

  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function BranchForm({
  name,
  address,
  phone,
  onNameChange,
  onAddressChange,
  onPhoneChange,
  onSubmit,
}: Props) {
  return (
    <form
      id="branch-form"
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Nama Cabang
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Nama cabang"
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Alamat
        </label>

        <textarea
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Alamat cabang"
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Nomor Telepon
        </label>

        <input
          type="text"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Nomor telepon"
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
        />
      </div>
    </form>
  );
}