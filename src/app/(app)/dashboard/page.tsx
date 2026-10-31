"use client";
import { useState } from "react";
import { Stethoscope, Users, Activity, AlertCircle } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { getErrorMessage } from "@/lib/api";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import PatientsTrendChart from "@/components/dashboard/PatientsTrendChart";
import PatientsPerDoctorChart from "@/components/dashboard/PatientsPerDoctorChart";
import ConditionsChart from "@/components/dashboard/ConditionsChart";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

const RANGES = [7, 30, 90];

export default function DashboardPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError, error, refetch } = useDashboard(days);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of doctors and patients</p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                days === r ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle size={18} /> {getErrorMessage(error)}
          </span>
          <button onClick={() => refetch()} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {isLoading && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total doctors" value={data.totals.doctors} icon={Stethoscope} />
            <StatCard label="Total patients" value={data.totals.patients} icon={Users} />
            <StatCard
              label="Avg. patients per doctor"
              value={data.totals.avgPatientsPerDoctor}
              icon={Activity}
            />
          </div>

          <ChartCard
            title="New registrations"
            subtitle={`Patients and doctors added in the last ${data.rangeDays} days`}
          >
            <PatientsTrendChart
              days={data.rangeDays}
              patients={data.patientsDaily}
              doctors={data.doctorsDaily}
            />
          </ChartCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Patients per doctor" subtitle="Top 10 doctors by patient count">
              {data.patientsPerDoctor.length ? (
                <PatientsPerDoctorChart data={data.patientsPerDoctor} />
              ) : (
                <EmptyState title="No data yet" />
              )}
            </ChartCard>

            <ChartCard title="Patient conditions" subtitle="Most common conditions">
              {data.conditions.length ? (
                <ConditionsChart data={data.conditions} />
              ) : (
                <EmptyState title="No data yet" />
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}