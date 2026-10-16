"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import Modal from "@/components/ui/Modal";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function DeleteProductButton({
  productId,
  productName,
  onSuccess,
  onError,
}: DeleteProductButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const supabase = createClient();

  async function handleDelete() {
    if (deleting) return;

    const branchId = getActiveBranchId();

    if (!branchId) {
      onError("Cabang aktif belum dipilih.");
      return;
    }

    setDeleting(true);

    try {
      const { error } = await supabase.rpc("delete_new_product", {
        p_product_id: productId,
        p_branch_id: branchId,
      });

      if (error) {
        console.error("Gagal menghapus produk:", error);

        const message = error.message.toLowerCase();

        if (message.includes("riwayat transaksi")) {
          onError(
            "Produk tidak dapat dihapus karena sudah memiliki riwayat transaksi."
          );
        } else if (message.includes("pergerakan stok")) {
          onError(
            "Produk tidak dapat dihapus karena memiliki pergerakan stok selain stok awal."
          );
        } else if (message.includes("tidak ditemukan")) {
          onError(
            "Produk tidak ditemukan di cabang aktif. Silakan muat ulang data."
          );
        } else {
          onError(
            "Produk gagal dihapus. Periksa koneksi dan izin akses, lalu coba lagi."
          );
        }

        return;
      }

      onSuccess();
    } catch (error) {
      console.error(
        "Terjadi kesalahan saat menghapus produk:",
        error
      );

      onError("Terjadi kesalahan saat menghapus produk.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={deleting}
        title="Hapus produk"
        aria-label={`Hapus produk ${productName}`}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={16} />
        Hapus
      </button>

      <Modal
        open={confirmOpen}
        title="Konfirmasi Hapus Produk"
        onClose={() => {
          if (!deleting) setConfirmOpen(false);
        }}
        maxWidth="max-w-md"
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                void handleDelete();
              }}
              disabled={deleting}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Ya, Hapus
            </button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-zinc-600">
          Yakin ingin menghapus produk{" "}
          <span className="font-semibold text-zinc-900">
            &quot;{productName}&quot;
          </span>
          ?
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Produk hanya dapat dihapus jika belum memiliki riwayat
          transaksi atau pergerakan stok selain stok awal.
        </p>
      </Modal>
    </>
  );
}