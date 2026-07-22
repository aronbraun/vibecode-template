"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";

// Working end-to-end example: shadcn UI -> tRPC -> Zod -> Mongoose -> MongoDB.
// When you start building the real app, delete this component together with
// src/trpc/routers/notes.ts and src/server/models/note.ts.
export function NotesDemo() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  const notes = useQuery(trpc.notes.list.queryOptions());
  const addNote = useMutation(
    trpc.notes.add.mutationOptions({
      onSuccess: async () => {
        setText("");
        await queryClient.invalidateQueries(trpc.notes.list.queryFilter());
      },
    }),
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Notes demo</CardTitle>
        <CardDescription>
          Each note goes through tRPC + Zod into MongoDB (in-memory unless
          MONGODB_URI is set).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (text.trim()) addNote.mutate({ text });
          }}
        >
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Write a note..."
            maxLength={500}
          />
          <Button type="submit" disabled={addNote.isPending || !text.trim()}>
            {addNote.isPending ? "Adding..." : "Add"}
          </Button>
        </form>

        {notes.isPending && (
          <p className="text-sm text-muted-foreground">Loading notes...</p>
        )}
        {notes.isError && (
          <p className="text-sm text-destructive">
            Could not load notes — check the server logs.
          </p>
        )}
        {notes.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No notes yet — add the first one.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {notes.data?.map((note) => (
            <li key={note.id} className="rounded-md border px-3 py-2 text-sm">
              {note.text}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
