import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import VisitChart from "@/components/dashboard/VisitChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ExpiringMemberships from "@/components/dashboard/ExpiringMemberships";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Footprints,
  Receipt,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const cookieStore = await cookies();
  const branchId = cookieStore.get("activeBranchId")?.value;

  const now = new Date();

  const today = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });

  const EXPIRING_DAYS = 14;

  const expiringDate = new Date(now);
  expiringDate.setDate(
    expiringDate.getDate() + EXPIRING_DAYS
  );

  const expiringDateLimit = expiringDate.toLocaleDateString(
    "en-CA",
    {
      timeZone: "Asia/Jakarta",
    }
  );

  const startOfYear = `${now.getFullYear()}-01-01`;

  // =========================
  // DATA UNTUK GRAFIK KUNJUNGAN
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
    // Data grafik kunjungan
    supabase
      .from("visits")
      .select("visit_date")
      .eq("branch_id", branchId)
      .gte("visit_date", startOfYear)
      .lte("visit_date", today),

    // Member terbaru
    supabase
      .from("members")
      .select("id, name, created_at")
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .limit(10),

    // Kunjungan terbaru
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

    // Membership terbaru
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

    // Transaksi terbaru
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

    // Sesi trainer terbaru
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
      members (name)
    `)
      .order("created_at", { ascending: false })
      .limit(10),

    // Perubahan stok terbaru
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

  // Transaksi pendaftaran member baru
  const registrationTransactions = (
    recentTransactions ?? []
  ).filter(
    (transaction) =>
      transaction.transaction_type === "registration"
  );

  // =========================
  // TIPE DATA AKTIVITAS
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

  // =========================
  // AKTIVITAS MEMBER BARU
  // =========================

  const memberActivities: DashboardActivity[] =
    (recentMembers ?? []).map((member) => {
      const registration = registrationTransactions.find(
        (transaction) =>
          transaction.member_id === member.id
      );

      return {
        id: `member-${member.id}`,
        type: "member",
        created_at: member.created_at,
        name: member.name,
        detail: "Member baru",
        value: registration
          ? `Rp ${registration.total_amount.toLocaleString(
            "id-ID"
          )}`
          : "—",
      };
    });

  // =========================
  // AKTIVITAS KUNJUNGAN
  // =========================

  const visitActivities: DashboardActivity[] =
    (recentVisits ?? []).map((visit) => {
      const member = Array.isArray(visit.members)
        ? visit.members[0] ?? null
        : visit.members ?? null;

      return {
        id: `visit-${visit.id}`,
        type: "visit",
        created_at: visit.created_at,
        name:
          member?.name ??
          visit.visitor_name ??
          "Pengunjung",
        detail: member
          ? "Kunjungan Member"
          : "Kunjungan Non-member",
        value:
          visit.visit_fee > 0
            ? `Rp ${visit.visit_fee.toLocaleString(
              "id-ID"
            )}`
            : "Rp 0",
      };
    });

  // =========================
  // AKTIVITAS TRANSAKSI
  // =========================

  const transactionActivities: DashboardActivity[] =
    (recentTransactions ?? [])
      .filter((transaction) => {
        if (transaction.transaction_type === "registration") {
          return false;
        }

        const customerName =
          transaction.customer_name?.toLowerCase() ?? "";

        const notes =
          transaction.notes?.toLowerCase() ?? "";

        const isNonMemberVisitTransaction =
          customerName.includes("biaya kunjungan non-member") ||
          notes.includes("biaya kunjungan non-member");

        if (isNonMemberVisitTransaction) {
          return false;
        }

        return true;
      })
      .map((transaction) => {
        const member = Array.isArray(transaction.members)
          ? transaction.members[0] ?? null
          : transaction.members ?? null;

        // Cari membership yang dibuat oleh member yang sama
        // pada waktu yang sama dengan transaksi.
        const membership = (
          recentMemberships ?? []
        ).find(
          (membership) =>
            membership.member_id === transaction.member_id &&
            membership.created_at ===
            transaction.transaction_date
        );

        const plan = membership
          ? Array.isArray(
            membership.membership_plans
          )
            ? membership.membership_plans[0] ?? null
            : membership.membership_plans ?? null
          : null;

        let detail = "Transaksi Lainnya";

        if (
          transaction.transaction_type === "membership"
        ) {
          detail = `Pembayaran Membership${plan?.name ? ` • ${plan.name}` : ""
            }`;
        } else if (
          transaction.transaction_type === "product"
        ) {
          detail = "Pembelian Produk";
        } else if (
          transaction.transaction_type === "trainer"
        ) {
          detail = transaction.notes?.trim()
            ? transaction.notes
            : "Pembelian Paket Trainer";
        } else if (transaction.notes) {
          detail = transaction.notes;
        }

        return {
          id: `transaction-${transaction.id}`,
          type: "transaction",
          created_at: transaction.created_at,
          name:
            member?.name ??
            transaction.customer_name ??
            transaction.notes ??
            "—",
          detail,
          value: `Rp ${transaction.total_amount.toLocaleString(
            "id-ID"
          )}`,
        };
      });

  // =========================
  // AKTIVITAS TRAINER
  // =========================

  const trainerActivities: DashboardActivity[] =
    (recentTrainerSessions ?? [])
      .filter((session) => {
        // Sesi dengan transaksi terkait sudah ditampilkan
        // melalui aktivitas transaksi.
        return !session.transaction_id;
      })
      .map((session) => {
        const member = Array.isArray(session.members)
          ? session.members[0] ?? null
          : session.members ?? null;

        return {
          id: `trainer-${session.id}`,
          type: "trainer",
          created_at: session.created_at,
          name:
            member?.name ??
            session.visitor_name ??
            "Pengunjung",
          detail: member
            ? "Sesi Trainer"
            : "Sesi Trainer Non-member",
          value: `Rp ${session.price.toLocaleString(
            "id-ID"
          )}`,
        };
      });

  // =========================
  // AKTIVITAS INVENTORY
  // =========================

  const inventoryActivities: DashboardActivity[] =
    (recentStockMovements ?? []).map((movement) => {
      const product = Array.isArray(movement.products)
        ? movement.products[0] ?? null
        : movement.products ?? null;

      return {
        id: `inventory-${movement.id}`,
        type: "inventory",
        created_at: movement.created_at,
        name: product?.name ?? "Produk",
        detail:
          movement.type === "in"
            ? "Stok Masuk"
            : "Stok Keluar",
        value:
          movement.type === "in"
            ? `+${movement.quantity}`
            : `-${movement.quantity}`,
      };
    });

  // =========================
  // GABUNGKAN SEMUA AKTIVITAS
  // =========================

  const activities = [
    ...memberActivities,
    ...visitActivities,
    ...transactionActivities,
    ...trainerActivities,
    ...inventoryActivities,
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

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
      .gte("transaction_date", `${today}T00:00:00`)
      .lt("transaction_date", `${today}T23:59:59.999`),
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
        members (
          name
        ),
        membership_plans (
          name
        )
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
      {/* =========================
          HEADER DASHBOARD
      ========================= */}

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

      {/* =========================
          GRAFIK KUNJUNGAN
      ========================= */}

      <div className="mb-6 mt-6">
        <VisitChart visits={visits ?? []} />
      </div>

      {/* =========================
    STATISTIK
========================= */}

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

      {/* =========================
          AKTIVITAS TERBARU
      ========================= */}

      <RecentActivity activities={activities} />

      {/* =========================
          MEMBERSHIP AKAN BERAKHIR
      ========================= */}

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