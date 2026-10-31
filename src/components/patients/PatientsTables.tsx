import { memo } from "react";
import Link from "next/link";
import { Pencil, Phone, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { Patient } from "@/types";

interface Props {
  patients: Patient[];
  loading?: boolean;
  dimmed?: boolean;
  showDoctor?: boolean;
  onEdit?: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  emptyAction?: React.ReactNode;
}

const getDoctor = (p: Patient) => (typeof p.doctor === "object" ? p.doctor : null);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Actions({
  patient,
  onEdit,
  onDelete,
}: Pick<Props, "onEdit" | "onDelete"> & { patient: Patient }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onEdit && (
        <Button size="sm" variant="ghost" onClick={() => onEdit(patient)} aria-label={`Edit ${patient.name}`}>
          <Pencil size={15} />
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onDelete(patient)}
        aria-label={`Delete ${patient.name}`}
        className="text-red-600 hover:bg-red-50"
      >
        <Trash2 size={15} />
      </Button>
    </div>
  );
}

function PatientsTable({ patients, loading, dimmed, showDoctor, onEdit, onDelete, emptyAction }: Props) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (!patients.length) {
    return (
      <EmptyState
        title="No patients found"
        description="Try changing your search or filters."
        action={emptyAction}
      />
    );
  }

  return (
    <div className={dimmed ? "opacity-60 transition-opacity" : "transition-opacity"}>
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Patient</th>
              <th className="px-4 py-3 font-semibold">Age / Gender</th>
              <th className="px-4 py-3 font-semibold">Condition</th>
              {showDoctor && <th className="px-4 py-3 font-semibold">Doctor</th>}
              <th className="px-4 py-3 font-semibold">Added</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((p) => {
              const doc = getDoctor(p);
              return (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.age} · {cap(p.gender)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                      {p.condition}
                    </span>
                  </td>
                  {showDoctor && (
                    <td className="px-4 py-3">
                      {doc ? (
                        <Link href={`/doctors/${doc._id}`} className="text-teal-700 hover:underline">
                          {doc.name}
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Actions patient={p} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {patients.map((p) => {
          const doc = getDoctor(p);
          return (
            <li key={p._id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{p.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {p.condition}
                    </span>
                    <span className="text-xs text-slate-500">
                      {p.age} · {cap(p.gender)}
                    </span>
                  </div>
                </div>
                <Actions patient={p} onEdit={onEdit} onDelete={onDelete} />
              </div>
              <div className="mt-3 space-y-1 text-xs text-slate-500">
                <p className="flex items-center gap-2"><Phone size={13} /> {p.phone}</p>
                {showDoctor && doc && (
                  <p>
                    Doctor:{" "}
                    <Link href={`/doctors/${doc._id}`} className="text-teal-700">
                      {doc.name}
                    </Link>
                  </p>
                )}
                <p>Added {formatDate(p.createdAt)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default memo(PatientsTable);