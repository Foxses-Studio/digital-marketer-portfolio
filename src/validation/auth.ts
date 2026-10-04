import { z } from "zod";

/** Shared by client forms (UX) and Server Actions (enforcement). */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Email is too long.")
  .pipe(z.email("Enter a valid email address."));

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters.")
  .max(80, "Keep the name under 80 characters.");

export const PASSWORD_RULES = [
  "At least 12 characters",
  "Includes a letter and a number",
] as const;

export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(128, "Use at most 128 characters.")
  .regex(/\p{L}/u, "Include at least one letter.")
  .regex(/\p{N}/u, "Include at least one number.");

export const loginSchema = z.object({
  email: emailSchema,
  // No policy check on login: it would reveal the rules for existing
  // passwords and block accounts created under older rules.
  password: z.string().min(1, "Enter your password.").max(128, "Password is too long."),
});

export const setupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match.",
  });

export type LoginInput = z.input<typeof loginSchema>;
export type SetupInput = z.input<typeof setupSchema>;
