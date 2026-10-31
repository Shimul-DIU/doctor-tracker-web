import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cleanParams } from "@/lib/utils";
import type { Paginated, Patient } from "@/types";

export interface PatientQuery {
  page: number;
  limit: number;
  search?: string;
  condition?: string;
  doctor?: string;
  from?: string;
  to?: string;
}

export type PatientInput = Pick<Patient, "name" | "age" | "gender" | "phone" | "condition">;

export function usePatients(query: PatientQuery) {
  return useQuery({
    queryKey: ["patients", query],
    queryFn: async () =>
      (await api.get<Paginated<Patient>>("/patients", { params: cleanParams(query) })).data,
    placeholderData: keepPreviousData,
  });
}

export function usePatientConditions() {
  return useQuery({
    queryKey: ["patient-conditions"],
    queryFn: async () => (await api.get<{ conditions: string[] }>("/patients/conditions")).data.conditions,
    staleTime: 5 * 60_000,
  });
}

export function useDoctorPatients(
  doctorId: string,
  query: { page: number; limit: number; search?: string; condition?: string }
) {
  return useQuery({
    queryKey: ["doctor-patients", doctorId, query],
    queryFn: async () =>
      (
        await api.get<Paginated<Patient>>(`/doctors/${doctorId}/patients`, {
          params: cleanParams(query),
        })
      ).data,
    placeholderData: keepPreviousData,
    enabled: !!doctorId,
  });
}

function useRefreshPatients() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["patients"] }),
      qc.invalidateQueries({ queryKey: ["doctor-patients"] }),
      qc.invalidateQueries({ queryKey: ["patient-conditions"] }),
      qc.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
}

export function useAddPatient() {
  const refresh = useRefreshPatients();
  return useMutation({
    mutationFn: async ({ doctorId, values }: { doctorId: string; values: PatientInput }) =>
      (await api.post<Patient>(`/doctors/${doctorId}/patients`, values)).data,
    onSuccess: refresh,
  });
}

export function useUpdatePatient() {
  const refresh = useRefreshPatients();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: PatientInput }) =>
      (await api.put<Patient>(`/patients/${id}`, values)).data,
    onSuccess: refresh,
  });
}

export function useDeletePatient() {
  const refresh = useRefreshPatients();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/patients/${id}`)).data,
    onSuccess: refresh,
  });
}

export function useRemoveDoctorPatient() {
  const refresh = useRefreshPatients();
  return useMutation({
    mutationFn: async ({ doctorId, patientId }: { doctorId: string; patientId: string }) =>
      (await api.delete(`/doctors/${doctorId}/patients/${patientId}`)).data,
    onSuccess: refresh,
  });
}