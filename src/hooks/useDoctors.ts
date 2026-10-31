import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cleanParams } from "@/lib/utils";
import type { Doctor, Paginated } from "@/types";

export interface DoctorQuery {
  page: number;
  limit: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  from?: string;
  to?: string;
}

export type DoctorInput = Omit<Doctor, "_id" | "createdAt">;

export function useDoctors(query: DoctorQuery) {
  return useQuery({
    queryKey: ["doctors", query],
    queryFn: async () =>
      (await api.get<Paginated<Doctor>>("/doctors", { params: cleanParams(query) })).data,
    placeholderData: keepPreviousData, // পেজ বদলালে আগের তালিকা দেখায়, ঝিলিক দেয় না
  });
}

export function useDoctorFilters() {
  return useQuery({
    queryKey: ["doctor-filters"],
    queryFn: async () =>
      (await api.get<{ specializations: string[]; hospitals: string[] }>("/doctors/filters")).data,
    staleTime: 5 * 60_000,
  });
}

function useRefreshDoctors() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["doctors"] }),
      qc.invalidateQueries({ queryKey: ["doctor-filters"] }),
      qc.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
}

export function useCreateDoctor() {
  const refresh = useRefreshDoctors();
  return useMutation({
    mutationFn: async (values: DoctorInput) => (await api.post<Doctor>("/doctors", values)).data,
    onSuccess: refresh,
  });
}

export function useUpdateDoctor() {
  const refresh = useRefreshDoctors();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: DoctorInput }) =>
      (await api.put<Doctor>(`/doctors/${id}`, values)).data,
    onSuccess: refresh,
  });
}

export function useDeleteDoctor() {
  const refresh = useRefreshDoctors();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/doctors/${id}`)).data,
    onSuccess: refresh,
  });
}