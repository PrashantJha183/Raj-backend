import dotenv from "dotenv";
dotenv.config();

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "JWT_SECRET"];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing env variable: ${key}`);
  }
});
