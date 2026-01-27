import { z } from "zod";

/* =========================
   REGISTER
========================= */
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
  });

/* =========================
   SEND OTP (LOGIN)
========================= */
export const sendOtpSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).optional(),
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
    phone: z.string().min(10).max(15).optional(),
    otp: z.string().length(6, "OTP must be 6 digits"),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
  });
