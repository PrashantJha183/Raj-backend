import { z } from "zod";

const indianPhone = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Phone must be a valid 10-digit Indian number");

/* =========================
   REGISTER
========================= */
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email().optional(),
    phone: indianPhone.optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
  });

/* =========================
   SEND OTP
========================= */
export const sendOtpSchema = z
  .object({
    email: z.string().email().optional(),
    phone: indianPhone.optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
  });

/* =========================
   VERIFY OTP
========================= */
export const verifyOtpSchema = z
  .object({
    email: z.string().email().optional(),
    phone: indianPhone.optional(),
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
  });
