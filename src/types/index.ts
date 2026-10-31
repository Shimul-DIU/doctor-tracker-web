export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: Meta;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  phone: string;
  condition: string;
  doctor: string | { _id: string; name: string; specialization: string };
  createdAt: string;
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface DashboardStats {
  totals: { doctors: number; patients: number; avgPatientsPerDoctor: number };
  patientsPerDoctor: { doctorId: string; name: string; count: number }[];
  patientsDaily: DailyCount[];
  doctorsDaily: DailyCount[];
  conditions: { condition: string; count: number }[];
  rangeDays: number;
}