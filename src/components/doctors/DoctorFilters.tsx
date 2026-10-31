import { FilterX } from "lucide-react";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export interface DoctorFilterValues {
  specialization: string;
  hospital: string;
  from: string;
  to: string;
}

export const emptyDoctorFilters: DoctorFilterValues = {
  specialization: "",
  hospital: "",
  from: "",
  to: "",
};

interface Props {
  values: DoctorFilterValues;
  specializations: string[];
  hospitals: string[];
  onChange: (values: DoctorFilterValues) => void;
}

export default function DoctorFilters({ values, specializations, hospitals, onChange }: Props) {
  const set = (key: keyof DoctorFilterValues) => (v: string) => onChange({ ...values, [key]: v });
  const active = Object.values(values).some(Boolean);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <Select
        label="Specialization"
        value={values.specialization}
        onChange={(e) => set("specialization")(e.target.value)}
      >
        <option value="">All</option>
        {specializations.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>
      <Select label="Hospital" value={values.hospital} onChange={(e) => set("hospital")(e.target.value)}>
        <option value="">All</option>
        {hospitals.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </Select>
      <Input
        label="Added from"
        type="date"
        value={values.from}
        max={values.to || undefined}
        onChange={(e) => set("from")(e.target.value)}
      />
      <Input
        label="Added to"
        type="date"
        value={values.to}
        min={values.from || undefined}
        onChange={(e) => set("to")(e.target.value)}
      />
      <Button variant="ghost" onClick={() => onChange(emptyDoctorFilters)} disabled={!active}>
        <FilterX size={16} /> Reset
      </Button>
    </div>
  );
}