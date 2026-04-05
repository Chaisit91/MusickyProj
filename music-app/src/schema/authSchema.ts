import { z } from "zod";

// ─── Reusable Field Schemas ───────────────────────────────────────────────────
export const nameField            = z.string().min(2, "Name must be at least 2 characters");
export const emailField           = z.email("Invalid email").refine((v) => v.endsWith("@gmail.com"), "Only @gmail.com");
export const passwordField        = z.string().min(6, "Password must be at least 6 characters");
export const confirmPasswordField = z.string().min(1, "Please confirm your password");

// ─── Register Schema ──────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name:            nameField,
  email:           emailField,
  password:        passwordField,
  confirmPassword: confirmPasswordField,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

