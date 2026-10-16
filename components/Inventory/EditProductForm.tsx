"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type EditProductFormProps = {
  productId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function EditProductForm({
  productId,
  onSuccess,
  onError,
}: EditProductFormProps) {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [minStock, setMinStock] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);

      const branchId = getActiveBranchId();

      if (!branchId) {
        onError("Cabang aktif belum dipilih.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("name, category, price, min_stock, status")
        .eq("id", productId)
        .eq("branch_id", branchId)
        .single();

      if (error || !data) {
        console.error("Gagal mengambil data produk:", error);
        onError("Gagal mengambil data produk.");
        setLoading(false);
        return;
      }

      setName(data.name || "");
      setCategory(data.category || "");
      setPrice(String(data.price ?? ""));
      setMinStock(String(data.min_stock ?? ""));
      setStatus(data.status || "active");

      setLoading(false);
    }

    void loadProduct();
  }, [productId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      const branchId = getActiveBranchId();

      if (!branchId) {
        onError("Cabang aktif belum dipilih.");
        return;
      }

      const { error } = await supabase
        .from("products")
        .update({
          name: name.trim(),
          category: category.trim() || null,
          price: Number(price),
          min_stock: Number(minStock),
          status,
        })
        .eq("id", productId)
        .eq("branch_id", branchId);

      if (error) {
        console.error("Gagal mengubah produk:", error);
        onError("Gagal mengubah produk. Silakan coba lagi.");
        return;
      }

      onSuccess();
    } catch (error) {
      console.error("Terjadi kesalahan saat mengubah produk:", error);
      onError("Terjadi kesalahan saat mengubah produk.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-zinc-500">
        Memuat data produk...
      </p>
    );
  }

  return (
    <form
      id="edit-product-form"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="product-name"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Nama Produk
        </label>

        <input
          id="product-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label
          htmlFor="product-category"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Kategori
        </label>

        <input
          id="product-category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={saving}
          placeholder="Contoh: Minuman"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label
          htmlFor="product-price"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Harga
        </label>

        <input
          id="product-price"
          type="number"
          min="0"
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={saving}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label
          htmlFor="product-min-stock"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Minimum Stok
        </label>

        <input
          id="product-min-stock"
          type="number"
          min="0"
          step="1"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          disabled={saving}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label
          htmlFor="product-status"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Status
        </label>

        <select
          id="product-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={saving}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        >
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>
    </form>
  );
}