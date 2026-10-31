"use client";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Building2, Calendar, Mail, Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useDoctor } from "@/hooks/useDoctors";
import {
  useAddPatient,
  useDoctorPatients,
  usePatientConditions,
  useRemoveDoctorPatient,
} from "@/hooks/usePatients";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import SearchInput from "@/components/ui/SearchInput";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PatientForm, { type PatientFormValues } from "@/components/patients/PatientForm";
import PatientsTable from "@/components/patients/PatientsTable";
import type { Patient } from "@/types";

const LIMIT = 8;

export default function DoctorDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: doctor, isLoading, isError, error } = useDoctor(id);

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [condition, setCondition] = useState("");
  const [page, setPage] = useState(1);

  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<Patient | null>(null);

  const query = useMemo(() => ({ page, limit: LIMIT, search, condition }), [page, search, condition]);
  const { data, isLoading: loadingPatients, isPlaceholderData } = useDoctorPatients(id, query);
  const { data: conditions } = usePatientConditions();

  const addMut = useAddPatient();
  const removeMut = useRemoveDoctorPatient();

  const closeAdd = useCallback(() => setAddOpen(false), []);
  const askRemove = useCallback((p: Patient) => setRemoving(p), []);

  const handleAdd = async (values: PatientFormValues) => {
    try {
      await addMut.mutateAsync({ doctorId: id, values });
      toast.success("Patient added");
      setAddOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleRemove = async () => {
    if (!removing) return;
    try {
      await removeMut.mutateAsync({ doctorId: id, patientId: removing._id });
      toast.success("Patient removed");
      if (data && data.items.length === 1 && page > 1) setPage(page - 1);
      setRemoving(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const back = (
    <Link
      href="/doctors"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-700"
    >
      <ArrowLeft size={16} /> Back to doctors
    </Link>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {back}
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="space-y-6">
        {back}
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} /> {getErrorMessage(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {back}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{doctor.name}</h1>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
            {doctor.specialization}
          </span>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
          <p className="flex items-center gap-2"><Building2 size={16} className="text-slate-400" /> {doctor.hospital}</p>
          <p className="flex items-center gap-2"><Phone size={16} className="text-slate-400" /> {doctor.phone}</p>
          <p className="flex items-center gap-2 break-all"><Mail size={16} className="text-slate-400" /> {doctor.email}</p>
          <p className="flex items-center gap-2"><Calendar size={16} className="text-slate-400" /> Added {formatDate(doctor.createdAt)}</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Patients</h2>
            <p className="text-sm text-slate-500">
              {data ? `${data.meta.total} patient${data.meta.total === 1 ? "" : "s"} under this doctor` : "Loading..."}
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={18} /> Add patient
          </Button>
        </div>

        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px]">
          <SearchInput
            value={searchInput}
            onChange={(v) => {
              setSearchInput(v);
              setPage(1);
            }}
            placeholder="Search by name or condition"
          />
          <Select
            aria-label="Condition"
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All conditions</option>
            {(conditions ?? []).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <PatientsTable
            patients={data?.items ?? []}
            loading={loadingPatients}
            dimmed={isPlaceholderData}
            onDelete={askRemove}
            emptyAction={
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus size={16} /> Add patient
              </Button>
            }
          />
          {data && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              limit={data.meta.limit}
              onChange={setPage}
            />
          )}
        </div>
      </section>

      <Modal open={addOpen} onClose={closeAdd} title={`Add patient to ${doctor.name}`} size="lg">
        <PatientForm submitting={addMut.isPending} onSubmit={handleAdd} onCancel={closeAdd} />
      </Modal>

      <ConfirmDialog
        open={!!removing}
        title="Remove patient"
        confirmLabel="Remove"
        message={
          <>
            Remove <strong>{removing?.name}</strong> from {doctor.name}&apos;s patient list? This deletes the
            patient record.
          </>
        }
        loading={removeMut.isPending}
        onConfirm={handleRemove}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}