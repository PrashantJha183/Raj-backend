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

router.post("/register", validate(registerSchema), register);

router.post("/login", otpLimiter, validate(sendOtpSchema), login);

router.post(
  "/verify-otp",
  verifyOtpLimiter,
  validate(verifyOtpSchema),
  verifyOtp,
);

/**
 * Refresh access token (OIDC-style)
 */
router.post("/refresh", refresh);

/**
 * Logout (revoke refresh token)
 */
router.post("/logout", logout);

router.get("/me", authMiddleware, getMe);

export default router;
