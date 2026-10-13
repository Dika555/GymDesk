import {
  Users,
  CreditCard,
  CalendarCheck,
  Receipt,
  Wallet,
  ChartNoAxesCombined,
} from "lucide-react";

type SummaryReportProps = {
  newMembers: number;
  newMemberships: number;
  totalVisits: number;
  totalTransactions: number;
  totalRevenue: number;
};

export default function SummaryReport({
  newMembers,
  newMemberships,
  totalVisits,
  totalTransactions,
  totalRevenue,
}: SummaryReportProps) {
  const summaryItems = [
    {
      label: "Member Baru",
      value: newMembers.toLocaleString("id-ID"),
      icon: Users,
    },
    {
      label: "Membership Baru",
      value: newMemberships.toLocaleString("id-ID"),
      icon: CreditCard,
    },
    {
      label: "Total Kunjungan",
      value: totalVisits.toLocaleString("id-ID"),
      icon: CalendarCheck,
    },
    {
      label: "Total Transaksi",
      value: totalTransactions.toLocaleString("id-ID"),
      icon: Receipt,
    },
    {
      label: "Total Pendapatan",
      value: `Rp ${totalRevenue.toLocaleString("id-ID")}`,
      icon: Wallet,
    },
  ];

  return (
    <section className="mt-6 rounded-2xl border border-zinc-300 bg-white p-5 shadow-sm sm:p-6">
      {/* HEADER */}
      <div className="flex items-start gap-3 border-b border-zinc-200 pb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
          <ChartNoAxesCombined size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">
            Ringkasan
          </h2>

          <p className="mt-1 text-sm text-zinc-600">
            Ringkasan data operasional berdasarkan periode yang dipilih.
          </p>
        </div>
      </div>

      {/* KARTU STATISTIK */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {summaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="group rounded-xl border border-zinc-300 bg-white p-4 transition-colors hover:border-orange-300 hover:bg-orange-50/30">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-600">
                  {item.label}
                </p>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <Icon size={20} />
                </div>
              </div>

              <p className="mt-4 break-words text-2xl font-bold tracking-tight text-zinc-900">
                {item.value}
              </p>

              <div className="mt-3 h-1 w-10 rounded-full bg-orange-500 transition-[width] duration-500 ease-in-out group-hover:w-45" />
            </div>
          );
        })}
      </div>
    </section>
  );
}