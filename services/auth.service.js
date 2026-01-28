import crypto from "crypto";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";
import { logger } from "../config/logger.js";
import { mailer } from "../utils/mailer.js";

/* =========================
   CONFIG
========================= */

const OTP_EXPIRY_MINUTES = 5;
const OTP_COOLDOWN_MS = 30_000; // 30 seconds
const MAX_OTP_ATTEMPTS = 5;
const IS_PROD = process.env.NODE_ENV === "production";

/* =========================
   HELPERS
========================= */

const normalizeEmail = (email) => email?.trim().toLowerCase();
const normalizePhone = (phone) => (phone ? `+91${phone.trim()}` : null);

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");

const generateOtp = () => crypto.randomInt(100000, 999999);

/* =========================
   TOKEN HELPERS
========================= */

const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.SUPABASE_JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL,
    issuer: "ecommerce-api",
    audience: "user",
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.SUPABASE_JWT_REFRESH_SECRET, {
    expiresIn: `${process.env.REFRESH_TOKEN_TTL_DAYS}d`,
    issuer: "ecommerce-api",
    audience: "refresh",
  });

/* =========================
   REGISTER (NO OTP)
========================= */

export const registerService = async ({ name, email, phone }) => {
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`)
    .maybeSingle();

  if (existing) {
    throw new Error("User already registered");
  }

  const { error } = await supabase.from("users").insert({
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    is_verified: false,
    is_active: true,
  });

  if (error) {
    logger.error({ error }, "User registration failed");
    throw new Error("Registration failed");
  }

  logger.info({ email: cleanEmail, phone: cleanPhone }, "User registered");
  return { success: true };
};

/* =========================
   SEND OTP (LOGIN)
========================= */

export const sendOtpService = async ({ email, phone }) => {
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);

  const { data: user } = await supabase
    .from("users")
    .select("id, email, phone, is_active")
    .or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`)
    .maybeSingle();

  if (!user) throw new Error("User not registered");
  if (!user.is_active) throw new Error("User account is disabled");

  /* OTP cooldown check */
  const { data: lastOtp } = await supabase
    .from("user_otps")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    lastOtp &&
    Date.now() - new Date(lastOtp.created_at).getTime() < OTP_COOLDOWN_MS
  ) {
    throw new Error("Please wait before requesting another OTP");
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

  /* Invalidate previous OTPs */
  await supabase
    .from("user_otps")
    .update({ verified: true })
    .eq("user_id", user.id)
    .eq("verified", false);

  const { error } = await supabase.from("user_otps").insert({
    user_id: user.id,
    otp_hash: otpHash,
    expires_at: expiresAt,
    attempts: 0,
  });

  if (error) {
    logger.error({ error }, "OTP generation failed");
    throw new Error("OTP generation failed");
  }

  if (cleanEmail) {
    await mailer.sendMail({
      from: `"My E-Commerce App" <${process.env.SMTP_USER}>`,
      to: cleanEmail,
      subject: "Your Login OTP",
      html: `
        <p>Your login OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
      `,
    });
  }

  if (!IS_PROD) logger.debug({ otp }, "DEV OTP");

  return { success: true };
};

/* =========================
   VERIFY OTP (LOGIN)
========================= */

export const verifyOtpService = async ({ email, phone, otp }) => {
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);

  const { data: user } = await supabase
    .from("users")
    .select("id, email, phone, is_verified, is_active")
    .or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`)
    .maybeSingle();

  if (!user || !user.is_active) {
    throw new Error("Invalid user");
  }

  const { data: otpRecord } = await supabase
    .from("user_otps")
    .select("id, otp_hash, expires_at, attempts")
    .eq("user_id", user.id)
    .eq("verified", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!otpRecord) throw new Error("OTP expired or invalid");

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("Too many invalid attempts");
  }

  if (new Date(otpRecord.expires_at) < new Date()) {
    throw new Error("OTP expired");
  }

  if (hashOtp(otp) !== otpRecord.otp_hash) {
    await supabase
      .from("user_otps")
      .update({ attempts: otpRecord.attempts + 1 })
      .eq("id", otpRecord.id);

    throw new Error("Invalid OTP");
  }

  await supabase
    .from("user_otps")
    .update({ verified: true })
    .eq("id", otpRecord.id);

  if (!user.is_verified) {
    await supabase
      .from("users")
      .update({ is_verified: true })
      .eq("id", user.id);
  }

  /* ISSUE TOKENS */
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = signRefreshToken({ userId: user.id });

  await supabase.from("refresh_tokens").insert({
    user_id: user.id,
    token: refreshToken,
    expires_at: new Date(
      Date.now() + Number(process.env.REFRESH_TOKEN_TTL_DAYS) * 86400000,
    ),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
    },
  };
};

/* =========================
   REFRESH TOKEN
========================= */

export const refreshTokenService = async ({ refreshToken }) => {
  const decoded = jwt.verify(
    refreshToken,
    process.env.SUPABASE_JWT_REFRESH_SECRET,
  );

  const { data: stored } = await supabase
    .from("refresh_tokens")
    .select("*")
    .eq("token", refreshToken)
    .eq("revoked", false)
    .maybeSingle();

  if (!stored) throw new Error("Refresh token invalid");

  await supabase
    .from("refresh_tokens")
    .update({ revoked: true })
    .eq("id", stored.id);

  const newAccessToken = signAccessToken({ userId: decoded.userId });
  const newRefreshToken = signRefreshToken({ userId: decoded.userId });

  await supabase.from("refresh_tokens").insert({
    user_id: decoded.userId,
    token: newRefreshToken,
    expires_at: new Date(
      Date.now() + Number(process.env.REFRESH_TOKEN_TTL_DAYS) * 86400000,
    ),
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/* =========================
   LOGOUT
========================= */

export const logoutService = async ({ refreshToken }) => {
  if (!refreshToken) return;

  await supabase
    .from("refresh_tokens")
    .update({ revoked: true })
    .eq("token", refreshToken);
};
