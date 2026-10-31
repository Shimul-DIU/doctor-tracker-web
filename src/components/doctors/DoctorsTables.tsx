import { memo } from "react";
import Link from "next/link";
import { Mail, Pencil, Phone, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { Doctor } from "@/types";

interface Props {
  doctors: Doctor[];
  loading?: boolean;
  dimmed?: boolean;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

function Actions({ doctor, onEdit, onDelete }: Pick<Props, "onEdit" | "onDelete"> & { doctor: Doctor }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button size="sm" variant="ghost" onClick={() => onEdit(doctor)} aria-label={`Edit ${doctor.name}`}>
        <Pencil size={15} />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onDelete(doctor)} aria-label={`Delete ${doctor.name}`}
        className="text-red-600 hover:bg-red-50">
        <Trash2 size={15} />
      </Button>
    </div>
  );
}

function DoctorsTable({ doctors, loading, dimmed, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (!doctors.length) {
    return (
      <EmptyState
        title="No doctors found"
        description="Try changing your search or filters, or add a new doctor."
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
              <th className="px-4 py-3 font-semibold">Doctor</th>
              <th className="px-4 py-3 font-semibold">Specialization</th>
              <th className="px-4 py-3 font-semibold">Hospital</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Added</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doctors.map((d) => (
              <tr key={d._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/doctors/${d._id}`} className="font-medium text-teal-700 hover:underline">
                    {d.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                    {d.specialization}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{d.hospital}</td>
                <td className="px-4 py-3 text-slate-600">
                  <div>{d.phone}</div>
                  <div className="text-xs text-slate-400">{d.email}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(d.createdAt)}</td>
                <td className="px-4 py-3">
                  <Actions doctor={d} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {doctors.map((d) => (
          <li key={d._id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/doctors/${d._id}`} className="font-semibold text-teal-700">
                  {d.name}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                    {d.specialization}
                  </span>
                  <span className="text-xs text-slate-500">{d.hospital}</span>
                </div>
              </div>
              <Actions doctor={d} onEdit={onEdit} onDelete={onDelete} />
            </div>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p className="flex items-center gap-2"><Phone size={13} /> {d.phone}</p>
              <p className="flex items-center gap-2 break-all"><Mail size={13} /> {d.email}</p>
              <p>Added {formatDate(d.createdAt)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default memo(DoctorsTable);