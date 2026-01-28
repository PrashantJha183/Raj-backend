import express from "express";
import {
  register,
  login,
  verifyOtp,
  refresh,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  otpLimiter,
  verifyOtpLimiter,
} from "../middlewares/rateLimit.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from "../validations/auth.schema.js";

const router = express.Router();

/**
 * Register (ALL FIELDS REQUIRED)
 */
router.post("/register", validate(registerSchema), register);

/**
 * Login (Send OTP)
 */
router.post("/login", validate(sendOtpSchema), otpLimiter, login);

/**
 * Verify OTP (Login)
 */
router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  verifyOtpLimiter,
  verifyOtp,
);

/**
 * Refresh access token
 */
router.post("/refresh", refresh);

/**
 * Logout (revoke refresh token)
 */
router.post("/logout", logout);

/**
 * Get current user
 */
router.get("/me", authMiddleware, getMe);

export default router;
