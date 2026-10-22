"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { logActivity } from "@/lib/activity-log";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type Props = {
  onSuccess: () => void;
  showSubmitButton: boolean;
};

export default function AddProductTransactionForm({
  onSuccess,
  showSubmitButton,
}: Props) {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [saving, setSaving] = useState(false);
  type FeedbackType = "success" | "error" | "warning" | "info";

  useEffect(() => {
    async function getData() {
      const branchId = getActiveBranchId();

      if (!branchId) {
        setProducts([]);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock")
        .eq("branch_id", branchId)
        .eq("status", "active")
        .order("name", { ascending: true });

      if (error) {
        console.error(
          "Gagal mengambil produk:",
          error,
        );
        return;
      }

      setProducts(data ?? []);
    }

    getData();
  }, []);

  const [feedback, setFeedback] = useState({
    open: false,
    title: "",
    message: "",
    type: "info" as FeedbackType,
  });

  function showFeedback(
    title: string,
    message: string,
    type: FeedbackType = "info",
  ) {
    setFeedback({
      open: true,
      title,
      message,
      type,
    });
  }

  function closeFeedback() {
    setFeedback((prev) => ({
      ...prev,
      open: false,
    }));
  }

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function addToCart() {
    const product = products.find(
      (item) => item.id === productId,
    );

    if (!product) {
      showFeedback(
        "Produk Belum Dipilih",
        "Pilih produk terlebih dahulu.",
        "warning",
      );
      return;
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      showFeedback(
        "Jumlah Tidak Valid",
        "Jumlah produk harus berupa bilangan bulat lebih dari 0.",
        "warning",
      );
      return;
    }

    const existingItem = cart.find(
      (item) => item.productId === product.id,
    );

    const newQuantity = existingItem
      ? existingItem.quantity + qty
      : qty;

    if (newQuantity > product.stock) {
      showFeedback(
        "Stok Tidak Mencukupi",
        `Stok ${product.name} hanya ${product.stock}.`,
        "warning",
      );
      return;
    }

    if (existingItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item,
        ),
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
        },
      ]);
    }

    setProductId("");
    setQuantity("1");
  }

  function removeFromCart(productId: string) {
    setCart(
      cart.filter((item) => item.productId !== productId),
    );
  }

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0,
  );

  const selectedProduct = products.find(
    (product) => product.id === productId,
  );

  const selectedProductTotal = selectedProduct
    ? selectedProduct.price * Number(quantity || 0)
    : 0;

  const total =
    cartTotal + selectedProductTotal;

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!customerName.trim()) {
      showFeedback(
        "Nama Belum Diisi",
        "Nama pelanggan harus diisi.",
        "warning",
      );
      return;
    }

    let itemsToSave = [...cart];

    // Masukkan produk yang masih dipilih tetapi belum ditambahkan.
    if (productId) {
      const product = products.find(
        (item) => item.id === productId,
      );

      const qty = Number(quantity);

      if (!product) {
        showFeedback(
          "Produk Tidak Ditemukan",
          "Silakan pilih produk yang tersedia.",
          "warning",
        );
        return;
      }

      if (!Number.isInteger(qty) || qty <= 0) {
        showFeedback(
          "Jumlah Tidak Valid",
          "Jumlah produk harus berupa bilangan bulat lebih dari 0.",
          "warning",
        );
        return;
      }

      const existingItem = itemsToSave.find(
        (item) => item.productId === product.id,
      );

      const newQuantity = existingItem
        ? existingItem.quantity + qty
        : qty;

      if (newQuantity > product.stock) {
        showFeedback(
          "Stok Tidak Mencukupi",
          `Stok ${product.name} hanya ${product.stock}.`,
          "warning",
        );
        return;
      }

      if (existingItem) {
        itemsToSave = itemsToSave.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item,
        );
      } else {
        itemsToSave.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
        });
      }
    }

    if (itemsToSave.length === 0) {
      showFeedback(
        "Produk Belum Dipilih",
        "Pilih setidaknya satu produk untuk transaksi.",
        "warning",
      );
      return;
    }

    const branchId = getActiveBranchId();

    if (!branchId) {
      showFeedback(
        "Cabang Belum Dipilih",
        "Pilih cabang aktif sebelum menyimpan transaksi.",
        "warning",
      );
      return;
    }

    setSaving(true);

    try {
      const items = itemsToSave.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      }));

      const { data: transactionId, error } =
        await supabase.rpc("create_product_transaction", {
          p_branch_id: branchId,
          p_member_id: null,
          p_payment_method: paymentMethod,
          p_notes: notes.trim() || null,
          p_items: items,
        });

      if (error) {
        console.error("Gagal membuat transaksi:", error);

        showFeedback(
          "Transaksi Gagal",
          error.message || "Transaksi produk gagal disimpan.",
          "error",
        );
        return;
      }

      if (!transactionId) {
        showFeedback(
          "Transaksi Gagal",
          "Transaksi tidak menghasilkan ID. Silakan periksa kembali data transaksi.",
          "error",
        );
        return;
      }

      // Simpan nama pelanggan pada transaksi yang baru dibuat.
      const { error: customerNameError } = await supabase
        .from("transactions")
        .update({
          customer_name: customerName.trim(),
        })
        .eq("id", transactionId)
        .eq("branch_id", branchId);

      if (customerNameError) {
        console.error(
          "Transaksi berhasil dibuat, tetapi nama pelanggan gagal disimpan:",
          customerNameError,
        );

        showFeedback(
          "Nama Pelanggan Gagal Disimpan",
          "Transaksi produk sudah dibuat, tetapi nama pelanggan gagal disimpan. Periksa kembali data transaksi sebelum mencoba menyimpan lagi.",
          "error",
        );
        return;
      }

      const productSummary = itemsToSave
        .map((item) => `${item.name} (${item.quantity})`)
        .join(", ");

      const transactionTotal = itemsToSave.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await logActivity({
        action: "CREATE",
        description: `Mencatat transaksi produk untuk ${customerName.trim()}: ${productSummary}, total Rp ${transactionTotal.toLocaleString("id-ID")}`,
        branchId,
      });

      // Bersihkan form setelah transaksi berhasil.
      setCustomerName("");
      setProductId("");
      setQuantity("1");
      setPaymentMethod("cash");
      setNotes("");
      setCart([]);

      // Beri tahu halaman induk agar daftar transaksi diperbarui.
      onSuccess();
    } catch (error) {
      console.error("Terjadi kesalahan saat menyimpan transaksi:", error);

      showFeedback(
        "Terjadi Kesalahan",
        "Transaksi gagal diproses. Silakan coba lagi.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form
        id="add-transaction-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Nama Pelanggan */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Nama Pelanggan
          </label>

          <input
            type="text"
            value={customerName}
            onChange={(e) =>
              setCustomerName(e.target.value)
            }
            placeholder="Masukkan nama pelanggan"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          />

          <p className="mt-1 text-xs text-zinc-500">
            Masukkan nama pelanggan yang melakukan pembelian produk.
          </p>
        </div>


        {/* Produk */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Produk
          </label>

          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Select
                options={products.map((product) => ({
                  value: product.id,
                  label: `${product.name} — ${formatRupiah(product.price)} — Stok ${product.stock}`,
                }))}
                value={
                  products
                    .map((product) => ({
                      value: product.id,
                      label: `${product.name} — ${formatRupiah(product.price)} — Stok ${product.stock}`,
                    }))
                    .find((product) => product.value === productId) ?? null
                }
                onChange={(option) => setProductId(option?.value ?? "")}
                isSearchable
                isClearable
                placeholder="Cari nama produk..."
                noOptionsMessage={() => "Produk tidak ditemukan"}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "42px",
                    borderRadius: "8px",
                    borderColor: "#d4d4d8",
                    boxShadow: "none",
                    fontSize: "14px",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 50,
                  }),
                }}
              />
            </div>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-20 rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
            />

            <button
              type="button"
              onClick={addToCart}
              disabled={saving}
              className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              Tambah
            </button>
          </div>
        </div>

        {/* Produk yang sedang dipilih */}
        {cart.length === 0 && selectedProduct && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">
                Total
              </span>

              <span className="text-lg font-bold text-zinc-900">
                {formatRupiah(total)}
              </span>
            </div>
          </div>
        )}

        {/* Keranjang */}
        {cart.length > 0 && (
          <div className="rounded-lg border border-zinc-200">
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <h3 className="text-sm font-semibold">
                Detail Produk
              </h3>
            </div>

            <div className="divide-y divide-zinc-100">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {item.name}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {item.quantity} ×{" "}
                      {formatRupiah(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {formatRupiah(
                        item.price * item.quantity,
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(
                          item.productId,
                        )
                      }
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-4">
              <span className="font-semibold">
                Total
              </span>

              <span className="text-lg font-bold">
                {formatRupiah(total)}
              </span>
            </div>
          </div>
        )}

        {/* Pembayaran */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Metode Pembayaran
          </label>

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value)
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          >
            <option value="cash">Cash</option>
            <option value="qris">QRIS</option>
            <option value="transfer">
              Transfer
            </option>
          </select>
        </div>

        {/* Catatan */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Catatan
          </label>

          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            placeholder="Opsional"
            rows={2}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          />
        </div>

        {/* Simpan */}
        {showSubmitButton && (
          <button
            type="submit"
            disabled={saving || !customerName.trim() || (!productId && cart.length === 0)}
            className="..."
          >
            {saving ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        )}
      </form>

      <FeedbackModal
        open={feedback.open}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
        onClose={closeFeedback}
      />
    </>
  );
}