import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/types";

export function useDashboard(days: number) {
  return useQuery({
    queryKey: ["dashboard", days],
    queryFn: async () =>
      (await api.get<DashboardStats>("/dashboard/stats", { params: { days } })).data,
  });
}