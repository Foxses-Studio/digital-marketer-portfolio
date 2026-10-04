import { z } from "zod";

const objectId = z.string().regex(/^[a-f0-9]{24}$/, "Invalid id.");

export const updateMediaAltSchema = z.object({
  id: objectId,
  alt: z.string().trim().max(200, "Keep alt text under 200 characters."),
});

export const deleteMediaSchema = z.object({ id: objectId });
