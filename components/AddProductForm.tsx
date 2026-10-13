"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import FeedbackModal from "@/components/FeedbackModal";

type Props = {
  onSuccess: () => void;
};

export default function AddProductForm({ onSuccess }: Props) {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [saving, setSaving] = useState(false);

  const [feedback, setFeedback] = useState({
    open: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
  });

  function showFeedback(
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) {
    setFeedback({
      open: true,
      title,
      message,
      type,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      showFeedback(
        "Data Belum Lengkap",
        "Nama produk harus diisi.",
        "warning"
      );
      return;
    }

    if (
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      showFeedback(
        "Harga Tidak Valid",
        "Harga produk tidak valid.",
        "warning"
      );
      return;
    }

    if (
      stock === "" ||
      !Number.isInteger(Number(stock)) ||
      Number(stock) < 0
    ) {
      showFeedback(
        "Stok Tidak Valid",
        "Stok produk tidak valid.",
        "warning"
      );
      return;
    }

    if (
      minStock === "" ||
      !Number.isInteger(Number(minStock)) ||
      Number(minStock) < 0
    ) {
      showFeedback(
        "Minimal Stok Tidak Valid",
        "Minimal stok tidak valid.",
        "warning"
      );
      return;
    }

    const branchId = getActiveBranchId();

    if (!branchId) {
      showFeedback(
        "Cabang Belum Dipilih",
        "Silakan pilih cabang aktif terlebih dahulu.",
        "warning"
      );
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.rpc(
        "add_product_with_initial_stock",
        {
          p_branch_id: branchId,
          p_name: name.trim(),
          p_category: category.trim() || null,
          p_price: Number(price),
          p_stock: Number(stock),
          p_min_stock: Number(minStock),
        }
      );

      if (error) {
        console.error("Gagal menyimpan produk. Kode error:", error.code);

        // 23505 = pelanggaran aturan UNIQUE di PostgreSQL
        if (error.code === "23505") {
          showFeedback(
            "Nama Produk Sudah Terdaftar",
            `Produk "${name.trim()}" sudah ada di cabang ini. Silakan gunakan nama produk lain.`,
            "warning"
          );
          return;
        }

        showFeedback(
          "Gagal Menyimpan Produk",
          "Produk belum berhasil disimpan. Silakan coba lagi.",
          "error"
        );
        return;
      }

      if (!data) {
        showFeedback(
          "Produk Gagal Dibuat",
          "Produk tidak berhasil dibuat.",
          "error"
        );
        return;
      }

      setName("");
      setCategory("");
      setPrice("");
      setStock("");
      setMinStock("");

      onSuccess();
    } catch (error) {
      console.error("Terjadi kesalahan:", error);

      showFeedback(
        "Terjadi Kesalahan",
        "Terjadi kesalahan saat menyimpan produk.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <FeedbackModal
        open={feedback.open}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
        onClose={() =>
          setFeedback((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />

      <form
        id="add-product-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Nama Produk
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Air Mineral"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Kategori
          </label>

          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Contoh: Minuman"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Harga
          </label>

          <input
            type="number"
            min="0"
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Contoh: 5000"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Stok Awal
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Contoh: 50"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Minimal Stok
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              placeholder="Contoh: 10"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
              required
            />
          </div>
        </div>
      </form>
    </>
  );
}