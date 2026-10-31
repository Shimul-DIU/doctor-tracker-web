"use client";
import { useCallback, useMemo, useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useCreateDoctor,
  useDeleteDoctor,
  useDoctorFilters,
  useDoctors,
  useUpdateDoctor,
} from "@/hooks/useDoctors";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DoctorForm, { type DoctorFormValues } from "@/components/doctors/DoctorForm";
import DoctorFilters, {
  emptyDoctorFilters,
  type DoctorFilterValues,
} from "@/components/doctors/DoctorFilters";
import DoctorsTable from "@/components/doctors/DoctorsTable";
import type { Doctor } from "@/types";

const LIMIT = 10;

export default function DoctorsPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [filters, setFilters] = useState<DoctorFilterValues>(emptyDoctorFilters);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState<Doctor | null>(null);

  const query = useMemo(
    () => ({ page, limit: LIMIT, search, ...filters }),
    [page, search, filters]
  );

  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useDoctors(query);
  const { data: filterOptions } = useDoctorFilters();

  const createMut = useCreateDoctor();
  const updateMut = useUpdateDoctor();
  const deleteMut = useDeleteDoctor();

  const handleSearch = (v: string) => {
    setSearchInput(v);
    setPage(1);
  };
  const handleFilters = (v: DoctorFilterValues) => {
    setFilters(v);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = useCallback((d: Doctor) => {
    setEditing(d);
    setFormOpen(true);
  }, []);
  const askDelete = useCallback((d: Doctor) => setDeleting(d), []);
  const closeForm = useCallback(() => setFormOpen(false), []);

  const handleSubmit = async (values: DoctorFormValues) => {
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing._id, values });
        toast.success("Doctor updated");
      } else {
        await createMut.mutateAsync(values);
        toast.success("Doctor added");
      }
      setFormOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMut.mutateAsync(deleting._id);
      toast.success("Doctor deleted");
      // পেজের শেষ রেকর্ড মুছলে আগের পেজে যাই
      if (data && data.items.length === 1 && page > 1) setPage(page - 1);
      setDeleting(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Doctors</h1>
          <p className="text-sm text-slate-500">
            {data ? `${data.meta.total} doctor${data.meta.total === 1 ? "" : "s"} in total` : "Manage your doctors"}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={18} /> Add doctor
        </Button>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <SearchInput
          value={searchInput}
          onChange={handleSearch}
          placeholder="Search by name, specialization or hospital"
        />
        <DoctorFilters
          values={filters}
          onChange={handleFilters}
          specializations={filterOptions?.specializations ?? []}
          hospitals={filterOptions?.hospitals ?? []}
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
        <DoctorsTable
          doctors={data?.items ?? []}
          loading={isLoading}
          dimmed={isPlaceholderData}
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

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Edit doctor" : "Add doctor"}
        size="lg"
      >
        <DoctorForm
          doctor={editing}
          submitting={createMut.isPending || updateMut.isPending}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete doctor"
        message={
          <>
            Are you sure you want to delete <strong>{deleting?.name}</strong>? All patients assigned to this
            doctor will be deleted too. This cannot be undone.
          </>
        }
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}