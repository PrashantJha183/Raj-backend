import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { apiLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

/**
 * Health check (light rate limit)
 */
router.get("/health", async (req, res, next) => {
  try {
    const { error } = await supabase.auth.getUser();

    if (error && error.message !== "Auth session missing!") {
      throw error;
    }

    res.json({
      status: "ok",
      supabase: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
