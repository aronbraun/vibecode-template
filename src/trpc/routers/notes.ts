import * as z from "zod";

import { noteInputSchema } from "@/lib/schemas/note";
import { NoteModel } from "@/server/models/note";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

// Example router. Copy this file's shape for every new domain,
// then merge it into src/trpc/routers/_app.ts.
export const notesRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ search: z.string().trim().max(100).default("") }))
    .query(async ({ input }) => {
      // Escape regex special characters so the user's text is matched literally.
      const literalSearch = input.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const filter = input.search
        ? { text: { $regex: literalSearch, $options: "i" } }
        : {};
      const notes = await NoteModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      // Return only what the UI needs, never whole database documents.
      return notes.map((note) => ({
        id: note._id.toString(),
        text: note.text,
        createdAt: note.createdAt.toISOString(),
      }));
    }),

  add: publicProcedure.input(noteInputSchema).mutation(async ({ input }) => {
    const note = await NoteModel.create({ text: input.text });
    console.info(`notes.add: created note ${note._id}`);
    return { id: note._id.toString() };
  }),
});
