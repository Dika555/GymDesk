"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  Dumbbell,
  ReceiptText,
  Package,
  ChartNoAxesCombined,
  Settings,
  Building2,
  LoaderCircle,
} from "lucide-react";

type LoadingScreenProps = {
  title?: string;
  description?: string;
};

const pageInfo: Record<
  string,
  {
    title: string;
    description: string;
    icon: typeof LayoutDashboard;
  }
> = {
  "/": {
    title: "Dashboard",
    description: "Sedang memuat data dashboard...",
    icon: LayoutDashboard,
  },
  "/members": {
    title: "Member",
    description: "Sedang memuat data member...",
    icon: Users,
  },
  "/membership": {
    title: "Membership",
    description: "Sedang memuat data membership...",
    icon: CreditCard,
  },
  "/visits": {
    title: "Kunjungan",
    description: "Sedang memuat data kunjungan...",
    icon: CalendarCheck,
  },
  "/trainers": {
    title: "Trainer",
    description: "Sedang memuat data trainer...",
    icon: Dumbbell,
  },
  "/transactions": {
    title: "Transaksi",
    description: "Sedang memuat data transaksi...",
    icon: ReceiptText,
  },
  "/inventory": {
    title: "Inventaris",
    description: "Sedang memuat data inventaris...",
    icon: Package,
  },
  "/reports": {
    title: "Laporan",
    description: "Sedang memuat data laporan...",
    icon: ChartNoAxesCombined,
  },
  "/admins": {
    title: "Kelola Admin",
    description: "Sedang memuat data admin...",
    icon: Users,
  },
  "/branches": {
    title: "Kelola Cabang",
    description: "Sedang memuat data cabang...",
    icon: Building2,
  },
  "/settings": {
    title: "Pengaturan",
    description: "Sedang memuat pengaturan...",
    icon: Settings,
  },
};

export default function LoadingScreen({
  title,
  description,
}: LoadingScreenProps) {
  const pathname = usePathname();

  const page =
    pageInfo[pathname] ??
    Object.entries(pageInfo)
      .filter(
        ([path]) =>
          path !== "/" && pathname.startsWith(`${path}/`)
      )
      .sort(([a], [b]) => b.length - a.length)
      .map(([, info]) => info)[0] ??
    {
      title: "GymDesk",
      description: "Sedang memuat halaman...",
      icon: LayoutDashboard,
    };

  const Icon = page.icon;

  return (
    <main className="min-h-screen bg-zinc-50 p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <Icon size={26} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            {title ?? page.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {description ?? page.description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex min-h-64 items-center justify-center rounded-xl border border-zinc-200 bg-white">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle
            size={36}
            className="animate-spin text-orange-500"
          />
          <p className="text-sm text-zinc-500">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    </main>
  );
}