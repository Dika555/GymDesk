"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import Select from "react-select";

type Product = {
  id: string;
  name: string;
  stock: number;
};

type AddStockFormProps = {
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function AddStockForm({
  onSuccess,
  onError,
}: AddStockFormProps) {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const branchId = getActiveBranchId();

    if (!branchId) {
      setProducts([]);
      setLoadingProducts(false);
      onError("Pilih cabang aktif terlebih dahulu.");
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock")
      .eq("branch_id", branchId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Gagal mengambil data produk:", error);
      onError("Gagal memuat data produk. Silakan coba lagi.");
    } else {
      setProducts(data ?? []);
    }

    setLoadingProducts(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const amount = Number(quantity);

    if (
      !productId ||
      !quantity ||
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      onError("Jumlah stok harus berupa bilangan bulat lebih dari 0.");
      return;
    }

    const branchId = getActiveBranchId();

    if (!branchId) {
      onError("Pilih cabang aktif terlebih dahulu.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.rpc("add_stock", {
        p_branch_id: branchId,
        p_product_id: productId,
        p_quantity: amount,
        p_description: description.trim() || null,
      });

      if (error) {
        console.error("Gagal menambahkan stok:", error);
        onError(error.message || "Gagal menambahkan stok.");
        return;
      }

      setProductId("");
      setQuantity("");
      setDescription("");

      onSuccess();
    } catch (error) {
      console.error("Gagal menambahkan stok:", error);
      onError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      id="add-stock-form"
      onSubmit={handleSubmit}
      className="w-full space-y-6"
    >
      {/* Produk */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-700">
          Produk
        </label>

        <Select
          options={products.map((product) => ({
            value: product.id,
            label: `${product.name} — Stok saat ini: ${product.stock}`,
          }))}
          value={
            products
              .map((product) => ({
                value: product.id,
                label: `${product.name} — Stok saat ini: ${product.stock}`,
              }))
              .find((product) => product.value === productId) ?? null
          }
          onChange={(option) => setProductId(option?.value ?? "")}
          isDisabled={loadingProducts || saving}
          isSearchable
          placeholder={
            loadingProducts ? "Memuat produk..." : "Cari nama produk..."
          }
          noOptionsMessage={() => "Produk tidak ditemukan"}
          styles={{
            control: (base) => ({
              ...base,
              minHeight: "44px",
              borderRadius: "8px",
              borderColor: "#d4d4d8",
              boxShadow: "none",
              fontSize: "14px",
            }),
          }}
        />

        <input
          type="text"
          required
          tabIndex={-1}
          aria-hidden="true"
          value={productId}
          onChange={() => { }}
          className="sr-only"
        />
      </div>

      {/* Jumlah Stok */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-700">
          Jumlah Stok
        </label>

        <input
          type="number"
          min="1"
          step="1"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={saving}
          placeholder="Masukkan jumlah stok"
          className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      {/* Keterangan */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-700">
          Keterangan
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={saving}
          placeholder="Contoh: Restock dari supplier"
          rows={4}
          className="w-full resize-y rounded-lg border border-zinc-300 px-3 py-3 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </div>
    </form>
  );
}