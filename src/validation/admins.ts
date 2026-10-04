import { z } from "zod";
import { ROLES } from "@/lib/permissions";
import { emailSchema, nameSchema, passwordSchema } from "./auth";

const objectId = z.string().regex(/^[a-f0-9]{24}$/, "Invalid id.");

export const createAdminSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: z.enum(ROLES, "Choose a role."),
  password: passwordSchema,
});

export const updateAdminRoleSchema = z.object({
  id: objectId,
  role: z.enum(ROLES, "Choose a role."),
});

export const setAdminStatusSchema = z.object({
  id: objectId,
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CreateAdminInput = z.input<typeof createAdminSchema>;
