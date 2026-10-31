"use client";
import { useCallback, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { useDoctorOptions } from "@/hooks/useDoctors";
import {
  useDeletePatient,
  usePatientConditions,
  usePatients,
  useUpdatePatient,
} from "@/hooks/usePatients";
import SearchInput from "@/components/ui/SearchInput";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PatientForm, { type PatientFormValues } from "@/components/patients/PatientForm";
import PatientFilters, {
  emptyPatientFilters,
  type PatientFilterValues,
} from "@/components/patients/PatientFilters";
import PatientsTable from "@/components/patients/PatientsTable";
import type { Patient } from "@/types";

const LIMIT = 10;

export default function PatientsPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [filters, setFilters] = useState<PatientFilterValues>(emptyPatientFilters);
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);

  const query = useMemo(() => ({ page, limit: LIMIT, search, ...filters }), [page, search, filters]);

  const { data, isLoading, isError, error, refetch, isPlaceholderData } = usePatients(query);
  const { data: conditions } = usePatientConditions();
  const { data: doctors } = useDoctorOptions();

  const updateMut = useUpdatePatient();
  const deleteMut = useDeletePatient();

  const handleSearch = (v: string) => {
    setSearchInput(v);
    setPage(1);
  };
  const handleFilters = (v: PatientFilterValues) => {
    setFilters(v);
    setPage(1);
  };

  const openEdit = useCallback((p: Patient) => setEditing(p), []);
  const askDelete = useCallback((p: Patient) => setDeleting(p), []);
  const closeEdit = useCallback(() => setEditing(null), []);

  const handleUpdate = async (values: PatientFormValues) => {
    if (!editing) return;
    try {
      await updateMut.mutateAsync({ id: editing._id, values });
      toast.success("Patient updated");
      setEditing(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMut.mutateAsync(deleting._id);
      toast.success("Patient deleted");
      if (data && data.items.length === 1 && page > 1) setPage(page - 1);
      setDeleting(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Patients</h1>
        <p className="text-sm text-slate-500">
          {data
            ? `${data.meta.total} patient${data.meta.total === 1 ? "" : "s"} in total`
            : "Manage all patients"}
          . New patients are added from a doctor&apos;s page.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <SearchInput value={searchInput} onChange={handleSearch} placeholder="Search by name or condition" />
        <PatientFilters
          values={filters}
          onChange={handleFilters}
          conditions={conditions ?? []}
          doctors={doctors ?? []}
        />
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <PatientsTable
          patients={data?.items ?? []}
          loading={isLoading}
          dimmed={isPlaceholderData}
          showDoctor
          onEdit={openEdit}
          onDelete={askDelete}
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

      <Modal open={!!editing} onClose={closeEdit} title="Edit patient" size="lg">
        {editing && (
          <PatientForm
            patient={editing}
            submitting={updateMut.isPending}
            onSubmit={handleUpdate}
            onCancel={closeEdit}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete patient"
        message={
          <>
            Are you sure you want to delete <strong>{deleting?.name}</strong>? This cannot be undone.
          </>
        }
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}