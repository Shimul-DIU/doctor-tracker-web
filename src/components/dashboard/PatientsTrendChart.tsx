"use client";
import { memo, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { lastNDays, shortDate } from "@/lib/utils";
import type { DailyCount } from "@/types";

interface Props {
  days: number;
  patients: DailyCount[];
  doctors: DailyCount[];
}

function PatientsTrendChart({ days, patients, doctors }: Props) {
  const data = useMemo(() => {
    const p = new Map(patients.map((d) => [d.date, d.count]));
    const d = new Map(doctors.map((x) => [x.date, x.count]));
    return lastNDays(days).map((date) => ({
      date,
      Patients: p.get(date) ?? 0,
      Doctors: d.get(date) ?? 0,
    }));
  }, [days, patients, doctors]);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gPatients" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ fontSize: 11 }}
            minTickGap={24}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip labelFormatter={(l) => shortDate(String(l))} />
          <Legend />
          <Area
            type="monotone"
            dataKey="Patients"
            stroke="#0d9488"
            strokeWidth={2}
            fill="url(#gPatients)"
          />
          <Area
            type="monotone"
            dataKey="Doctors"
            stroke="#6366f1"
            strokeWidth={2}
            fill="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(PatientsTrendChart);