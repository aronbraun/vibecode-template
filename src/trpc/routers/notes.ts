import * as z from "zod";
import { NoteModel } from "@/server/models/note";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

// Example router — copy this file's shape for every new domain,
// then merge it into src/trpc/routers/_app.ts.
export const notesRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    const notes = await NoteModel.find().sort({ createdAt: -1 }).limit(50).lean();
    // Return only what the UI needs, never whole database documents.
    return notes.map((note) => ({
      id: note._id.toString(),
      text: note.text,
      createdAt: note.createdAt.toISOString(),
    }));
  }),

  add: publicProcedure
    .input(z.object({ text: z.string().trim().min(1).max(500) }))
    .mutation(async ({ input }) => {
      const note = await NoteModel.create({ text: input.text });
      console.info(`notes.add: created note ${note._id}`);
      return { id: note._id.toString() };
    }),
});
