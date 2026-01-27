import {
  registerService,
  sendOtpService,
  verifyOtpService,
  refreshTokenService,
  logoutService,
} from "../services/auth.service.js";

/* =========================
   REGISTER (NO OTP)
========================= */
export const register = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body || {};

    const cleanName = name?.trim();
    const cleanEmail = email?.trim();
    const cleanPhone = phone?.trim();

    if (!cleanName || (!cleanEmail && !cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Name and email or phone are required",
      });
    }

    await registerService({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
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
    const { email, phone } = req.body || {};

    const cleanEmail = email?.trim();
    const cleanPhone = phone?.trim();

    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone is required",
      });
    }

    await sendOtpService({
      email: cleanEmail,
      phone: cleanPhone,
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
    const { email, phone, otp } = req.body || {};

    const cleanOtp = String(otp || "").trim();

    if (!cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const result = await verifyOtpService({
      email: email?.trim(),
      phone: phone?.trim(),
      otp: cleanOtp,
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
    const { refreshToken } = req.body || {};

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

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
    const { refreshToken } = req.body || {};

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
   GET CURRENT USER
========================= */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
