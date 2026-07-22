import "server-only";
import { model, models, Schema, type Model } from "mongoose";

// Example model — copy this file's shape for every new collection.
// One interface describes the document; the schema must match it.
export interface Note {
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<Note>(
  {
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

// The `models.Note ||` guard stops Next.js hot reloads from redefining the model.
export const NoteModel: Model<Note> =
  models.Note || model<Note>("Note", noteSchema);
