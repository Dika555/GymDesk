"use client";

import { useEffect, useState } from "react";
import {
  Boxes,
  Search as SearchIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import Search from "@/components/ui/Search";
import Pagination from "@/components/ui/Pagination";

type StockMovement = {
  id: string;
  type: string;
  quantity: number;
  description: string | null;
  created_at: string;
  products: {
    name: string;
  } | null;
};

export default function StockHistory() {
  const supabase = createClient();

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMovements([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("stock_movements")
      .select(`
        id,
        type,
        quantity,
        description,
        created_at,
        products (
          name
        )
      `)
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil riwayat stok.");
      alert("Gagal mengambil riwayat stok.");
      setMovements([]);
    } else {
      setMovements(
        (data ?? []).map((movement) => {
          const productData = movement.products;

          return {
            ...movement,
            products: Array.isArray(productData)
              ? productData[0] ?? null
              : productData,
          };
        }) as StockMovement[]
      );
    }

    setLoading(false);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const filteredMovements = movements.filter((movement) => {
    const keyword = search.trim().toLowerCase();

    const formattedDate = formatDate(movement.created_at).toLowerCase();
    const productName = movement.products?.name?.toLowerCase() ?? "";
    const description = movement.description?.toLowerCase() ?? "";

    const matchesSearch =
      formattedDate.includes(keyword) ||
      productName.includes(keyword) ||
      description.includes(keyword);

    const matchesType =
      typeFilter === "all" || movement.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(
    filteredMovements.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentMovements = filteredMovements.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter]);

  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      {/* HEADER */}
      <div className="flex items-start gap-3 border-b border-zinc-200 pb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
          <Boxes size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-zinc-900">
            Riwayat Stok
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Riwayat pergerakan stok masuk dan keluar pada cabang ini.
          </p>
        </div>
      </div>

      {/* SEARCH DAN FILTER */}
      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <Search
            value={search}
            onChange={setSearch}
            placeholder="Cari tanggal, produk, atau keterangan..."
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          aria-label="Filter jenis pergerakan stok"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 md:w-56"
        >
          <option value="all">Semua Jenis</option>
          <option value="in">Stok Masuk</option>
          <option value="out">Stok Keluar</option>
        </select>
      </div>

      {/* TABEL */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-200">
        {loading ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <Boxes size={28} className="text-zinc-400" />
            <p className="mt-3 text-sm text-zinc-500">
              Memuat riwayat stok...
            </p>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
              <Boxes size={24} />
            </div>

            <h3 className="mt-3 text-sm font-semibold text-zinc-800">
              {search || typeFilter !== "all"
                ? "Riwayat Tidak Ditemukan"
                : "Belum Ada Riwayat Stok"}
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              {search || typeFilter !== "all"
                ? "Coba ubah kata kunci atau filter yang digunakan."
                : "Pergerakan stok akan muncul di sini."}
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-zinc-100">
              <tr className="border-b-2 border-zinc-200">
                <th className="w-16 px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  No.
                </th>

                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Tanggal
                </th>

                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Produk
                </th>

                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Jenis
                </th>

                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Jumlah
                </th>

                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Keterangan
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {currentMovements.map((movement, index) => (
                <tr
                  key={movement.id}
                  className="transition-colors hover:bg-zinc-50"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-zinc-500">
                    {startIndex + index + 1}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-zinc-600">
                    {formatDate(movement.created_at)}
                  </td>

                  <td className="px-4 py-4 font-semibold text-zinc-900">
                    {movement.products?.name || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        movement.type === "in"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {movement.type === "in" ? (
                        <ArrowDownToLine size={13} />
                      ) : (
                        <ArrowUpFromLine size={13} />
                      )}

                      {movement.type === "in"
                        ? "Stok Masuk"
                        : "Stok Keluar"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold tabular-nums">
                    <span
                      className={
                        movement.type === "in"
                          ? "text-green-700"
                          : "text-red-600"
                      }
                    >
                      {movement.type === "in" ? "+" : "-"}
                      {movement.quantity}
                    </span>

                    <span className="ml-1 text-xs font-normal text-zinc-400">
                      unit
                    </span>
                  </td>

                  <td className="px-4 py-4 text-zinc-600">
                    {movement.description || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && filteredMovements.length > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredMovements.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </section>
  );
}