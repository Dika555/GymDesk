"use client";

import { useMemo, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type VisitChartProps = {
  visits: {
    visit_date: string;
  }[];
};

export default function VisitChart({
  visits,
}: VisitChartProps) {

  const [period, setPeriod] = useState<
    "weekly" | "monthly" | "yearly"
  >("weekly");

  const chartData = useMemo(() => {
    const now = new Date();

    if (period === "weekly") {
      const data = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);

        const dateString = date
          .toISOString()
          .split("T")[0];

        const total = visits.filter(
          (visit) =>
            visit.visit_date === dateString
        ).length;

        data.push({
          date: dateString,
          label: date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          total,
        });
      }

      return data;
    }

    if (period === "monthly") {
      const year = now.getFullYear();
      const month = now.getMonth();

      const daysInMonth = new Date(
        year,
        month + 1,
        0
      ).getDate();

      const data = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${String(
          month + 1
        ).padStart(2, "0")}-${String(day).padStart(
          2,
          "0"
        )}`;

        const total = visits.filter(
          (visit) =>
            visit.visit_date === dateString
        ).length;

        data.push({
          date: dateString,
          label: String(day),
          total,
        });
      }

      return data;
    }

    const year = now.getFullYear();

    const data = [];

    for (let month = 0; month < 12; month++) {
      const total = visits.filter((visit) => {
        const visitDate = new Date(visit.visit_date);

        return (
          visitDate.getFullYear() === year &&
          visitDate.getMonth() === month
        );
      }).length;

      data.push({
        date: new Date(
          year,
          month,
          1
        ).toLocaleDateString("id-ID", {
          month: "short",
        }),
        label: new Date(
          year,
          month,
          1
        ).toLocaleDateString("id-ID", {
          month: "short",
        }),
        total,
      });
    }

    return data;
  }, [visits, period]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Aktivitas Kunjungan
          </h2>

          <p className="text-sm text-zinc-500">
            Pantau jumlah kunjungan member berdasarkan periode.
          </p>
        </div>

        <select
          value={period}
          onChange={(event) =>
            setPeriod(
              event.target.value as
              | "weekly"
              | "monthly"
              | "yearly"
            )
          }
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="weekly">Mingguan</option>
          <option value="monthly">Bulanan</option>
          <option value="yearly">Tahunan</option>
        </select>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid
              stroke="#e4e4e7"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "#52525b",
                fontSize: 12,
              }}
              tickMargin={8}
              minTickGap={15}
            />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="total"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}