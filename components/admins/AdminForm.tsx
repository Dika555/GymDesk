"use client";

import { useState } from "react";
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
  password: string;
  branchId: string;

  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onBranchChange: (value: string) => void;

  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function AdminForm({
  editingAdmin,
  branches,
  name,
  email,
  password,
  branchId,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onBranchChange,
  onSubmit,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

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
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-orange-500"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="admin@gmail.com"
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-orange-500"
          required
        />
      </div>

      {!editingAdmin && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            Password Awal
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Minimal 6 karakter"
              minLength={6}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 pr-12 outline-none focus:border-orange-500"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
              title={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
              className="absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 transition-colors hover:text-orange-600"
            >
              {showPassword ? (
                // Ikon mata dicoret
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.58 10.58a2 2 0 002.83 2.83" />
                  <path d="M9.88 5.09A10.77 10.77 0 0112 4.88c5 0 8.27 4.11 9 7.12a9.65 9.65 0 01-2.1 3.67" />
                  <path d="M6.61 6.61A11.76 11.76 0 003 12c.73 3.01 4 7.12 9 7.12a10.5 10.5 0 004.12-.84" />
                </svg>
              ) : (
                // Ikon mata
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <p className="mt-1.5 text-xs text-zinc-500">
            Password minimal 6 karakter.
          </p>
        </div>
      )}

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
    </form>
  );
}