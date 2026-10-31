"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import type { Patient } from "@/types";

export const patientFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  age: z
    .number({ error: "Enter a valid age" })
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(130, "Age is too high"),
  gender: z.enum(["male", "female", "other"], { error: "Select a gender" }),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "Enter a valid phone number"),
  condition: z.string().trim().min(2, "Condition is required"),
});
export type PatientFormValues = z.infer<typeof patientFormSchema>;

interface Props {
  patient?: Patient | null;
  submitting?: boolean;
  onSubmit: (values: PatientFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export default function PatientForm({ patient, submitting, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: patient?.name ?? "",
      age: patient?.age,
      gender: patient?.gender,
      phone: patient?.phone ?? "",
      condition: patient?.condition ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input label="Full name" placeholder="Patient name" error={errors.name?.message} {...register("name")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Age"
          type="number"
          inputMode="numeric"
          placeholder="35"
          error={errors.age?.message}
          {...register("age", { valueAsNumber: true })}
        />
        <Select label="Gender" error={errors.gender?.message} {...register("gender")}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Phone"
          type="tel"
          placeholder="01800000000"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          label="Condition"
          placeholder="Hypertension"
          error={errors.condition?.message}
          {...register("condition")}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {patient ? "Save changes" : "Add patient"}
        </Button>
      </div>
    </form>
  );
}