"use client";

import { useEffect, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import {
  Package
} from "lucide-react";

type ProductReportItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  openingStock: number | null;
  stockIn: number;
  stockOut: number;
  endingStock: number | null;
  historyComplete: boolean;
};

type ProductReportProps = {
  products: ProductReportItem[];
};

const ITEMS_PER_PAGE = 20;

export default function ProductReport({
  products,
}: ProductReportProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(products.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const displayedProducts = products.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  function formatStock(value: number | null) {
    return value === null
      ? "Riwayat belum lengkap"
      : value.toLocaleString("id-ID");
  }

  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <Package size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
            Data Produk & Stok
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Pergerakan stok berdasarkan periode laporan.
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-zinc-50">
              <tr className="border-b border-zinc-200 text-left">
                {[
                  "No.",
                  "Produk",
                  "Kategori",
                  "Harga",
                  "Stok Awal",
                  "Stok Masuk",
                  "Stok Keluar",
                  "Stok Akhir",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {displayedProducts.length > 0 ? (
                displayedProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-zinc-50"
                  >
                    <td className="px-4 py-3.5 text-sm text-zinc-500">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-4 py-3.5 text-sm font-semibold text-zinc-900">
                      {product.name}
                    </td>

                    <td className="px-4 py-3.5 text-sm text-zinc-600">
                      {product.category || "-"}
                    </td>

                    <td className="px-4 py-3.5 text-sm text-zinc-600">
                      {product.price.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-sm text-zinc-600">
                      {formatStock(product.openingStock)}
                    </td>

                    <td className="px-4 py-3.5 text-sm text-green-700">
                      {product.stockIn.toLocaleString("id-ID")}
                    </td>

                    <td className="px-4 py-3.5 text-sm text-red-600">
                      {product.stockOut.toLocaleString("id-ID")}
                    </td>

                    <td className="px-4 py-3.5 text-sm font-semibold text-zinc-900">
                      {formatStock(product.endingStock)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-zinc-500"
                  >
                    Tidak ada data produk pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {products.length > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={products.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {products.some((product) => !product.historyComplete) && (
        <p className="mt-4 text-sm text-amber-700">
          Sebagian produk belum memiliki riwayat stok yang cukup untuk
          menghitung stok awal dan akhir secara akurat.
        </p>
      )}
    </div>
  );
}