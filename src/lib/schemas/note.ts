import * as z from "zod";

// Shared by the form in the browser and the tRPC procedure on the server,
// so the rules live in exactly one place.
export const noteInputSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Write something first.")
    .max(500, "Keep it under 500 characters."),
});

export type NoteInput = z.infer<typeof noteInputSchema>;
