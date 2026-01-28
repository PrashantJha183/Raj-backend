import {
  registerService,
  sendOtpService,
  verifyOtpService,
  refreshTokenService,
  logoutService,
} from "../services/auth.service.js";
import { supabase } from "../config/supabase.js";
/* =========================
   REGISTER (STRICT)
========================= */
export const register = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    await registerService({
      name,
      email,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "Registered successfully. Please login to verify.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   LOGIN (SEND OTP)
========================= */
export const login = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    await sendOtpService({
      email,
      phone,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   VERIFY OTP (LOGIN)
========================= */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, phone, otp } = req.body;

    const result = await verifyOtpService({
      email,
      phone,
      otp,
    });

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   REFRESH TOKEN
========================= */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await refreshTokenService({ refreshToken });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   LOGOUT
========================= */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    await logoutService({ refreshToken });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
/* =========================
   GET CURRENT USER (MINIMAL)
========================= */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.userId; // from JWT

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, phone, is_verified")
      .eq("id", userId)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};
