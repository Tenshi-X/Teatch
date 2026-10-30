import { z } from 'zod';
export const phoneSchema = z
  .string()
  .trim()
  .max(25)
  .refine((s) => !s || /^\+?[0-9 ()-]{9,25}$/.test(s), 'Nomor HP tidak valid');
export const onboardingSchema = z.object({
  fullName: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100),
  phoneNumber: phoneSchema,
});
