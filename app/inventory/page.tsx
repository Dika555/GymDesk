"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import AddProductButton from "@/components/AddProductButton";
import AddStockButton from "@/components/AddStockButton";
import StockHistory from "@/components/StockHistory";
import EditProductButton from "@/components/EditProductButton";
import DeleteProductButton from "@/components/DeleteProductButton";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import FeedbackModal from "@/components/FeedbackModal";
import {
  Package,
  Boxes,
  TriangleAlert
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stock: number;
  min_stock: number;
  status: string;
  created_at: string;
};

export default function InventoryPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );


  const lowStockProducts = products.filter(
    (product) =>
      product.stock > 0 &&
      product.stock <= product.min_stock
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stock <= 0
  ).length;


  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [feedback, setFeedback] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    open: false,
    title: "",
    message: "",
    type: "success",
  });

  function showFeedback(
    title: string,
    message: string,
    type: "success" | "error"
  ) {
    setFeedback({
      open: true,
      title,
      message,
      type,
    });
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [productSearch, stockFilter, categoryFilter]);

  async function getProducts() {
    setLoading(true);

    const branchId = getActiveBranchId();

    if (!branchId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, category, price, stock, min_stock, status, created_at"
      )
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil produk:", error);
      setLoading(false);
      return;
    }

    setProducts(data ?? []);
    setLoading(false);
  }

  const filteredProducts = products.filter((product) => {
    const keyword = productSearch.trim().toLowerCase();

    const matchesSearch = product.name
      .toLowerCase()
      .includes(keyword);

    const matchesCategory =
      categoryFilter === "all" ||
      product.category === categoryFilter;


    const stockStatus = getStockStatus(product);

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "available" &&
        stockStatus.label === "Tersedia") ||
      (stockFilter === "low" &&
        stockStatus.label === "Stok Menipis") ||
      (stockFilter === "out" &&
        stockStatus.label === "Stok Habis");


    return (
      matchesSearch &&
      matchesCategory &&
      matchesStock
    );
  });

  const totalPages = Math.ceil(
    filteredProducts.length / ITEMS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const categoryOptions = Array.from(
    new Set(
      products
        .map((product) => product.category)
        .filter((category): category is string => Boolean(category))
    )
  ).sort();

  useEffect(() => {
    getProducts();
  }, []);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }


  function getStockStatus(product: Product) {
    if (product.stock <= 0) {
      return {
        label: "Stok Habis",
        className: "border-red-200 bg-red-50 text-red-700",
      };
    }

    if (product.stock <= product.min_stock) {
      return {
        label: "Stok Menipis",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    }

    return {
      label: "Tersedia",
      className: "border-green-200 bg-green-50 text-green-700",
    };
  }


  return (
    <main className="min-h-screen bg-white p-6 text-zinc-900">
      {/* Header Inventory */}
        <div>
          {/* Judul, deskripsi, dan tombol utama */}
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Package size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                  Inventory
                </h1>

                <p className="mt-1 text-sm text-zinc-500 sm:text-base">
                  Kelola produk, pantau ketersediaan stok, dan catat
                  perubahan persediaan produk di cabang gym.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <AddStockButton
                onSuccess={() => {
                  void getProducts();
                }}
              />
              <AddProductButton
                onSuccess={() => {
                  void getProducts();
                }}
              />
            </div>
          </div>
        </div>

        {/* Statistik Inventory */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {/* Total Produk */}
          <div className="flex items-center gap-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="shrink-0 rounded-lg bg-orange-500 p-3 text-white">
              <Package size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-orange-800">
                Total Produk
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {products.length}
              </p>
              <p className="text-sm text-zinc-600">
                Jenis produk terdaftar
              </p>
            </div>
          </div>

          {/* Total Unit Stok */}
          <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="shrink-0 rounded-lg bg-blue-600 p-3 text-white">
              <Boxes size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-800">
                Total Unit Stok
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {products.reduce((total, product) => total + product.stock, 0)}
              </p>
              <p className="text-sm text-zinc-600">
                Seluruh unit produk
              </p>
            </div>
          </div>

          {/* Stok Menipis */}
          <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="shrink-0 rounded-lg bg-yellow-500 p-3 text-white">
              <TriangleAlert size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-yellow-600">
                Stok Menipis
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {products.filter((product) => product.stock <= product.min_stock).length}
              </p>
              <p className="text-sm text-zinc-600">
                Produk perlu diperiksa
              </p>
            </div>
          </div>


          {/* Stok Habis */}
          <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="shrink-0 rounded-lg bg-red-600 p-3 text-white">
              <Package size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-800">
                Stok Habis
              </p>

              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {outOfStockProducts}
              </p>

              <p className="text-sm text-zinc-600">
                Produk perlu diisi ulang
              </p>
            </div>
          </div>
        </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1">
          <Search
            value={productSearch}
            onChange={setProductSearch}
            placeholder="Cari nama produk..."
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
        >
          <option value="all">Semua Kategori</option>

          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
        >
          <option value="all">Semua Stok</option>
          <option value="available">Tersedia</option>
          <option value="low">Stok Menipis</option>
          <option value="out">Stok Habis</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-zinc-100">
              <tr className="border-b border-zinc-200 text-left">
                <th className="w-16 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  No
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Produk
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Kategori
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Harga
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Stok
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Status
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-zinc-500"
                  >
                    Memuat produk...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-zinc-500"
                  >
                    {productSearch ||
                      categoryFilter !== "all" ||
                      stockFilter !== "all"
                      ? "Produk tidak ditemukan."
                      : "Belum ada produk."}
                  </td>
                </tr>
              ) : (
                currentProducts.map((product, index) => {
                  const stockStatus = getStockStatus(product);

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-zinc-50/80"
                    >
                      <td className="px-5 py-4 text-sm tabular-nums text-zinc-500">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-zinc-900">
                          {product.name}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-600">
                        {product.category ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-zinc-800">
                        {formatRupiah(product.price)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-semibold ${product.stock <= 0
                            ? "text-red-600"
                            : product.stock <= product.min_stock
                              ? "text-amber-600"
                              : "text-zinc-800"
                            }`}
                        >
                          {product.stock}
                        </span>
                        <span className="ml-1 text-xs text-zinc-400">
                          unit
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <EditProductButton
                            productId={product.id}
                            onSuccess={() => {
                              showFeedback(
                                "Produk Berhasil Diubah",
                                `Perubahan produk "${product.name}" berhasil disimpan.`,
                                "success"
                              );

                              void getProducts();
                            }}
                            onError={(message) => {
                              showFeedback("Gagal Mengubah Produk", message, "error");
                            }}
                          />

                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                            onSuccess={() => {
                              showFeedback(
                                "Produk Berhasil Dihapus",
                                `Produk "${product.name}" berhasil dihapus.`,
                                "success"
                              );

                              void getProducts();
                            }}
                            onError={(message) => {
                              showFeedback("Gagal Menghapus Produk", message, "error");
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredProducts.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      <StockHistory />

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
    </main>
  );
}