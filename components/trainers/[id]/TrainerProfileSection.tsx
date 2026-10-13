"use client";

import { UserRound, Pencil, Power, Trash2, Phone, Award, Wallet } from "lucide-react";
import TrainerEditModal from "@/components/trainers/[id]/TrainerEditModal";
import type { Trainer } from "@/components/trainers/[id]/types";

type TrainerProfileSectionProps = {
    trainer: Trainer;
    saving: boolean;
    isEditing: boolean;
    name: string;
    phone: string;
    specialization: string;
    pricePerSession: string;
    onPricePerSessionChange: (value: string) => void;

    onStartEditing: () => void;
    onActivate: () => void;
    onDeactivate: () => void;
    onDelete: () => void;

    onNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onSpecializationChange: (value: string) => void;

    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCloseEdit: () => void;
};

export default function TrainerProfileSection({
    trainer,
    saving,
    isEditing,
    name,
    phone,
    specialization,
    pricePerSession,
    onPricePerSessionChange,
    onStartEditing,
    onActivate,
    onDeactivate,
    onDelete,
    onNameChange,
    onPhoneChange,
    onSpecializationChange,
    onSubmit,
    onCloseEdit,
}: TrainerProfileSectionProps) {
    const isActive = trainer.status === "active";

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                        <UserRound size={22} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">
                            Profil Trainer
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            Informasi mengenai trainer.
                        </p>
                    </div>
                </div>

                <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isActive
                        ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200"
                        : "bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200"
                        }`}
                >
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-zinc-400"
                            }`}
                    />
                    {isActive ? "Aktif" : "Tidak Aktif"}
                </span>
            </div>

            {/* Informasi trainer */}
            <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <div>
                    <p className="text-sm text-zinc-500">Nama Trainer</p>
                    <p className="mt-1 font-semibold text-zinc-900">
                        {trainer.name}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-zinc-500">Nomor HP</p>
                    <p className="mt-1 font-semibold text-zinc-900">
                        {trainer.phone || "-"}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-zinc-500">Spesialisasi</p>
                    <p className="mt-1 font-semibold text-zinc-900">
                        {trainer.specialization || "-"}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-zinc-500">Harga per Sesi</p>
                    <p className="mt-1 font-semibold text-zinc-900">
                        Rp {trainer.price_per_session.toLocaleString("id-ID")}
                    </p>
                </div>
            </div>

            {/* Tombol aksi */}
            <div className="mt-6 flex flex-wrap gap-3 border-t border-zinc-200 pt-5">
                <button
                    type="button"
                    onClick={onStartEditing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                    <Pencil size={16} />
                    Edit Trainer
                </button>

                <button
                    type="button"
                    onClick={isActive ? onDeactivate : onActivate}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isActive
                        ? "border-red-200 bg-white text-red-600 hover:bg-red-50 focus:ring-red-500"
                        : "border-green-200 bg-white text-green-700 hover:bg-green-50 focus:ring-green-500"
                        }`}
                >
                    <Power size={16} />
                    {isActive ? "Nonaktifkan Trainer" : "Aktifkan Kembali"}
                </button>

                {!isActive && (
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        {saving ? "Memproses..." : "Hapus Trainer"}
                    </button>
                )}
            </div>

            {/* Modal edit */}
            {isEditing && (
                <TrainerEditModal
                    name={name}
                    phone={phone}
                    specialization={specialization}
                    pricePerSession={pricePerSession}
                    onNameChange={onNameChange}
                    onPhoneChange={onPhoneChange}
                    onSpecializationChange={onSpecializationChange}
                    onPricePerSessionChange={onPricePerSessionChange}
                    onSubmit={onSubmit}
                    onClose={onCloseEdit}
                />
            )}
        </section>
    );
}