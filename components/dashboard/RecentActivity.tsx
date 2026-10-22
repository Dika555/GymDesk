
"use client";

import {
  UserPlus,
  CreditCard,
  Footprints,
  Receipt,
  Dumbbell,
  Package,
} from "lucide-react";

type Activity = {
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

type Props = {
  activities: Activity[];
};

export default function RecentActivity({ activities }: Props) {
  function formatDate(date: string) {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    });
  }

  function getActivityIcon(type: Activity["type"]) {
    switch (type) {
      case "member":
        return <UserPlus size={18} />;
      case "membership":
        return <CreditCard size={18} />;
      case "visit":
        return <Footprints size={18} />;
      case "transaction":
        return <Receipt size={18} />;
      case "trainer":
        return <Dumbbell size={18} />;
      case "inventory":
        return <Package size={18} />;
      default:
        return null;
    }
  }

  function getActivityLabel(type: Activity["type"]) {
    switch (type) {
      case "member":
        return "Member Baru";
      case "membership":
        return "Membership";
      case "visit":
        return "Kunjungan";
      case "transaction":
        return "Transaksi";
      case "trainer":
        return "Sesi Trainer";
      case "inventory":
        return "Perubahan Stok";
    }
  }

  return (
    <div className="mt-6 min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          Aktivitas Terbaru
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Daftar aktivitas terbaru yang terjadi di GymDesk.
        </p>
      </div>

      {activities.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Belum ada aktivitas.
        </p>
      ) : (
        <div className="activity-table-scroll w-full min-w-0 overflow-x-auto rounded-xl border border-zinc-200">
          <div className="max-h-60 min-w-[650px] overflow-y-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[8%]" />
                <col className="w-[18%]" />
                <col className="w-[25%]" />
                <col className="w-[24%]" />
                <col className="w-[25%]" />
              </colgroup>

              <thead className="sticky top-0 z-10 bg-zinc-100">
                <tr>
                  <th className="border-b border-zinc-300 px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                    No.
                  </th>
                  <th className="border-b border-zinc-300 px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                    Waktu
                  </th>
                  <th className="border-b border-zinc-300 px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                    Aktivitas
                  </th>
                  <th className="border-b border-zinc-300 px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                    Nama / Detail
                  </th>
                  <th className="border-b border-zinc-300 px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                    Nilai
                  </th>
                </tr>
              </thead>

              <tbody>
                {activities.map((activity, index) => (
                  <tr
                    key={activity.id}
                    className="border-b border-zinc-200 last:border-b-0 hover:bg-zinc-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-700">
                      {index + 1}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-700">
                      {formatDate(activity.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                          {getActivityIcon(activity.type)}
                        </div>
                        <span className="break-words text-sm font-medium text-zinc-900">
                          {getActivityLabel(activity.type)}
                        </span>
                      </div>
                    </td>

                    <td className="break-words px-4 py-3 text-sm text-zinc-700">
                      {activity.name}
                      {activity.detail && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {activity.detail}
                        </p>
                      )}
                    </td>

                    <td className="break-words px-4 py-3 text-left text-sm text-zinc-700">
                      {activity.value || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
