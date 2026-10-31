"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Doctor } from "@/types";

export const doctorFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  specialization: z.string().trim().min(2, "Specialization is required"),
  hospital: z.string().trim().min(2, "Hospital is required"),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email"),
});
export type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface Props {
  doctor?: Doctor | null;
  submitting?: boolean;
  onSubmit: (values: DoctorFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export default function DoctorForm({ doctor, submitting, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: doctor?.name ?? "",
      specialization: doctor?.specialization ?? "",
      hospital: doctor?.hospital ?? "",
      phone: doctor?.phone ?? "",
      email: doctor?.email ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input label="Full name" placeholder="Dr. Jane Doe" error={errors.name?.message} {...register("name")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Specialization"
          placeholder="Cardiology"
          error={errors.specialization?.message}
          {...register("specialization")}
        />
        <Input
          label="Hospital"
          placeholder="Square Hospital"
          error={errors.hospital?.message}
          {...register("hospital")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Phone"
          type="tel"
          placeholder="01700000000"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="doctor@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {doctor ? "Save changes" : "Add doctor"}
        </Button>
      </div>
    </form>
  );
}