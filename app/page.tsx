
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import VisitChart from "@/components/inventory/VisitChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ExpiringMemberships from "@/components/dashboard/ExpiringMemberships";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard,
  Users,
  Footprints,
  Receipt,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Ambil identitas pengguna dari sesi Supabase.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <main className="p-8 text-zinc-900">
        <h1 className="text-xl font-bold">
          Sesi tidak valid
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Silakan login kembali.
        </p>
      </main>
    );
  }

  // 2. Ambil role dan cabang resmi dari database.
  const { data: profile, error: profileError } =
    await supabase
      .from("users")
      .select("role, branch_id, is_active")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    !["admin", "super_admin"].includes(profile.role)
  ) {
    return (
      <main className="p-8 text-zinc-900">
        <h1 className="text-xl font-bold">
          Akses ditolak
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Akun tidak aktif atau tidak memiliki akses dashboard.
        </p>
      </main>
    );
  }

  // 3. Tentukan cabang berdasarkan role.
  const cookieStore = await cookies();
  const savedBranchId =
    cookieStore.get("activeBranchId")?.value;

  let branchId: string | null = null;

  if (profile.role === "admin") {
    // Admin selalu menggunakan cabang dari database.
    branchId = profile.branch_id;
  } else {
    // Super Admin boleh memilih cabang aktif.
    const { data: branches, error: branchError } =
      await supabase
        .from("branches")
        .select("id")
        .eq("is_active", true)
        .order("name");

    if (branchError) {
      console.error(
        "Gagal memuat cabang:",
        branchError.message
      );
    } else {
      const branchList = branches ?? [];

      branchId =
        branchList.find(
          (branch) => branch.id === savedBranchId
        )?.id ??
        branchList[0]?.id ??
        null;
    }
  }

  if (!branchId) {
    return (
      <main className="p-8 text-zinc-900">
        <h1 className="text-xl font-bold">
          Cabang belum tersedia
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Pastikan akun memiliki cabang yang aktif.
        </p>
      </main>
    );
  }

  const now = new Date();

  const today = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });

  const EXPIRING_DAYS = 14;

  const expiringDate = new Date(now);
  expiringDate.setDate(
    expiringDate.getDate() + EXPIRING_DAYS
  );

  const expiringDateLimit =
    expiringDate.toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

  const startOfYear = `${now.getFullYear()}-01-01`;

  // =========================
  // DATA DASHBOARD
  // =========================

  const [
    { data: visits },
    { data: recentMembers },
    { data: recentVisits },
    { data: recentMemberships },
    { data: recentTransactions },
    { data: recentTrainerSessions },
    { data: recentStockMovements },
  ] = await Promise.all([
    // Data grafik kunjungan.
    supabase
      .from("visits")
      .select("visit_date")
      .eq("branch_id", branchId)
      .gte("visit_date", startOfYear)
      .lte("visit_date", today),

    // Member terbaru.
    supabase
      .from("members")
      .select("id, name, created_at")
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .limit(10),

    // Kunjungan terbaru.
    supabase
      .from("visits")
      .select(`
        id,
        member_id,
        visitor_name,
        visit_date,
        visit_fee,
        payment_method,
        created_at,
        members (name)
      `)
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .limit(10),

    // Membership terbaru.
    supabase
      .from("memberships")
      .select(`
        id,
        member_id,
        created_at,
        members (name),
        membership_plans (name)
      `)
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .limit(10),

    // Transaksi terbaru.
    supabase
      .from("transactions")
      .select(`
        id,
        member_id,
        transaction_type,
        total_amount,
        transaction_date,
        created_at,
        status,
        customer_name,
        notes,
        members (name)
      `)
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .limit(50),

    // Sesi trainer terbaru.
    supabase
      .from("trainer_sessions")
      .select(`
        id,
        member_id,
        visitor_name,
        session_date,
        price,
        created_at,
        transaction_id,
        members (name),
        trainers!inner (branch_id)
      `)
      .eq("trainers.branch_id", branchId)
      .order("created_at", { ascending: false })
      .limit(10),

    // Perubahan stok terbaru.
    supabase
      .from("stock_movements")
      .select(`
        id,
        product_id,
        type,
        quantity,
        description,
        created_at,
        products (name)
      `)
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  // =========================
  // AKTIVITAS UTAMA GYMDESK
  // Tidak mengambil activity_logs.
  // =========================

  type DashboardActivity = {
    id: string;
    type:
      | "member"
      | "membership"
      | "visit"
      | "transaction"
      | "trainer"
      | "inventory";
    created_at: string;
    name: string;
    detail: string;
    value: string;
  };

  const activities: DashboardActivity[] = [
    // Member baru.
    ...(recentMembers ?? []).map((item) => ({
      id: `member-${item.id}`,
      type: "member" as const,
      created_at: item.created_at,
      name: item.name,
      detail: "Member baru ditambahkan",
      value: "-",
    })),

    // Kunjungan gym.
    ...(recentVisits ?? []).map((item) => {
      const member = Array.isArray(item.members)
        ? item.members[0] ?? null
        : item.members ?? null;

      return {
        id: `visit-${item.id}`,
        type: "visit" as const,
        created_at: item.created_at,
        name:
          member?.name ??
          item.visitor_name ??
          "Pengunjung",
        detail: "Kunjungan gym",
        value: `Rp${Number(
          item.visit_fee ?? 0
        ).toLocaleString("id-ID")}`,
      };
    }),

    // Membership baru.
    ...(recentMemberships ?? []).map((item) => {
      const member = Array.isArray(item.members)
        ? item.members[0] ?? null
        : item.members ?? null;

      const plan = Array.isArray(
        item.membership_plans
      )
        ? item.membership_plans[0] ?? null
        : item.membership_plans ?? null;

      return {
        id: `membership-${item.id}`,
        type: "membership" as const,
        created_at: item.created_at,
        name: member?.name ?? "Member",
        detail: plan?.name ?? "Membership baru",
        value: "-",
      };
    }),

    // Transaksi.
    ...(recentTransactions ?? []).map((item) => {
      const member = Array.isArray(item.members)
        ? item.members[0] ?? null
        : item.members ?? null;

      return {
        id: `transaction-${item.id}`,
        type: "transaction" as const,
        created_at: item.created_at,
        name:
          item.customer_name ??
          member?.name ??
          "Pelanggan",
        detail: item.notes ?? "Transaksi gym",
        value: `Rp${Number(
          item.total_amount ?? 0
        ).toLocaleString("id-ID")}`,
      };
    }),

    // Sesi personal trainer.
    ...(recentTrainerSessions ?? []).map((item) => {
      const member = Array.isArray(item.members)
        ? item.members[0] ?? null
        : item.members ?? null;

      return {
        id: `trainer-${item.id}`,
        type: "trainer" as const,
        created_at: item.created_at,
        name:
          member?.name ??
          item.visitor_name ??
          "Pengunjung",
        detail: "Sesi personal trainer",
        value: `Rp${Number(
          item.price ?? 0
        ).toLocaleString("id-ID")}`,
      };
    }),

    // Perubahan stok.
    ...(recentStockMovements ?? []).map((item) => {
      const product = Array.isArray(item.products)
        ? item.products[0] ?? null
        : item.products ?? null;

      return {
        id: `stock-${item.id}`,
        type: "inventory" as const,
        created_at: item.created_at,
        name: product?.name ?? "Produk",
        detail: `${item.type}: ${
          item.description ?? "Perubahan stok"
        }`,
        value: String(item.quantity ?? 0),
      };
    }),
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 10);

  // =========================
  // STATISTIK DASHBOARD
  // =========================

  const [
    { count: totalMember },
    { count: todayVisits },
    { count: todayTransactions },
  ] = await Promise.all([
    supabase
      .from("members")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("branch_id", branchId),

    supabase
      .from("visits")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("branch_id", branchId)
      .eq("visit_date", today),

    supabase
      .from("transactions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("branch_id", branchId)
      .eq("status", "completed")
      .gte(
        "transaction_date",
        `${today}T00:00:00`
      )
      .lt(
        "transaction_date",
        `${today}T23:59:59.999`
      ),
  ]);

  // =========================
  // MEMBERSHIP AKAN BERAKHIR
  // =========================

  const { data: expiringMemberships } =
    await supabase
      .from("memberships")
      .select(`
        id,
        end_date,
        members (name),
        membership_plans (name)
      `)
      .eq("branch_id", branchId)
      .eq("status", "active")
      .gte("end_date", today)
      .lte("end_date", expiringDateLimit)
      .order("end_date", {
        ascending: true,
      });

  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 lg:p-8">
      {/* HEADER DASHBOARD */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <LayoutDashboard size={26} />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-zinc-500 sm:text-base">
            Pantau kondisi dan aktivitas gym secara keseluruhan melalui ringkasan data dan statistik terbaru.
          </p>
        </div>
      </div>

      {/* GRAFIK KUNJUNGAN */}
      <div className="mb-6 mt-6">
        <VisitChart visits={visits ?? []} />
      </div>

      {/* STATISTIK */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Member"
          value={totalMember ?? 0}
          description="Jumlah seluruh member"
          icon={<Users size={30} />}
        />

        <StatCard
          title="Kunjungan Hari Ini"
          value={todayVisits ?? 0}
          description="Total kunjungan hari ini"
          icon={<Footprints size={30} />}
        />

        <StatCard
          title="Transaksi Hari Ini"
          value={todayTransactions ?? 0}
          description="Total transaksi hari ini"
          icon={<Receipt size={30} />}
        />
      </div>

      {/* AKTIVITAS TERBARU */}
      <RecentActivity activities={activities} />

      {/* MEMBERSHIP AKAN BERAKHIR */}
      <ExpiringMemberships
        memberships={(expiringMemberships ?? []).map(
          (membership) => ({
            id: membership.id,
            end_date: membership.end_date,
            members: Array.isArray(
              membership.members
            )
              ? membership.members[0] ?? null
              : membership.members ?? null,
            membership_plans: Array.isArray(
              membership.membership_plans
            )
              ? membership.membership_plans[0] ?? null
              : membership.membership_plans ?? null,
          })
        )}
      />
    </main>
  );
}