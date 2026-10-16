"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";

type BranchEditModalProps = {
    open: boolean;
    name: string;
    phone: string;
    address: string;
    saving: boolean;
    onClose: () => void;
    onSave: (
        name: string,
        phone: string,
        address: string
    ) => void;
};

export default function BranchEditModal({
    open,
    name,
    phone,
    address,
    saving,
    onClose,
    onSave,
}: BranchEditModalProps) {
    const [newName, setNewName] = useState(name);
    const [newPhone, setNewPhone] = useState(phone);
    const [newAddress, setNewAddress] = useState(address);

    useEffect(() => {
        setNewName(name);
        setNewPhone(phone);
        setNewAddress(address);
    }, [name, phone, address, open]);

    return (
        <Modal
    open={open}
    onClose={onClose}
    title="Edit Informasi Gym"
    footer={
        <div className="flex justify-end gap-2">
            <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
                Batal
            </button>

            <button
                type="button"
                onClick={() =>
                    onSave(
                        newName,
                        newPhone,
                        newAddress
                    )
                }
                disabled={saving}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
                {saving ? "Menyimpan..." : "Simpan"}
            </button>
        </div>
    }
>
    
            <div className="space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                        Nama Gym
                    </label>

                    <input
                        type="text"
                        value={newName}
                        onChange={(e) =>
                            setNewName(e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                        Nomor Telepon
                    </label>

                    <input
                        type="text"
                        value={newPhone}
                        onChange={(e) =>
                            setNewPhone(e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                        Alamat
                    </label>

                    <textarea
                        value={newAddress}
                        onChange={(e) =>
                            setNewAddress(e.target.value)
                        }
                        rows={3}
                        className="w-full resize-none rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>
            </div>
        </Modal>
    );
}