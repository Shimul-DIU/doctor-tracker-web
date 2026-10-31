import { FilterX } from "lucide-react";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export interface PatientFilterValues {
  condition: string;
  doctor: string;
  from: string;
  to: string;
}

export const emptyPatientFilters: PatientFilterValues = {
  condition: "",
  doctor: "",
  from: "",
  to: "",
};

interface Props {
  values: PatientFilterValues;
  conditions: string[];
  doctors: { _id: string; name: string }[];
  onChange: (values: PatientFilterValues) => void;
}

export default function PatientFilters({ values, conditions, doctors, onChange }: Props) {
  const set = (key: keyof PatientFilterValues) => (v: string) => onChange({ ...values, [key]: v });
  const active = Object.values(values).some(Boolean);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <Select label="Condition" value={values.condition} onChange={(e) => set("condition")(e.target.value)}>
        <option value="">All</option>
        {conditions.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </Select>
      <Select label="Doctor" value={values.doctor} onChange={(e) => set("doctor")(e.target.value)}>
        <option value="">All</option>
        {doctors.map((d) => (
          <option key={d._id} value={d._id}>{d.name}</option>
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
      <Button variant="ghost" onClick={() => onChange(emptyPatientFilters)} disabled={!active}>
        <FilterX size={16} /> Reset
      </Button>
    </div>
  );
}