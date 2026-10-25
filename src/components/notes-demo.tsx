"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";

import { TableSkeleton } from "@/components/table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { noteInputSchema, type NoteInput } from "@/lib/schemas/note";
import { useTRPC } from "@/trpc/client";

const noteColumns = ["Note", "Created"];

// Working end-to-end example: form (react-hook-form + Zod) -> tRPC -> Mongoose
// -> MongoDB, with the search text kept in the URL (nuqs), a skeleton while
// loading and a toast on success. When you start building the real app, delete
// this component together with src/trpc/routers/notes.ts,
// src/lib/schemas/note.ts and src/server/models/note.ts.
export function NotesDemo() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // The search text lives in the URL (?q=...), so reload, back button and
  // shared links all keep it.
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  // Only ask the server once the user pauses typing.
  const [debouncedSearch] = useDebounceValue(search, 300);

  const notes = useQuery(
    trpc.notes.list.queryOptions({ search: debouncedSearch }),
  );

  const form = useForm<NoteInput>({
    resolver: zodResolver(noteInputSchema),
    defaultValues: { text: "" },
  });

  const addNote = useMutation(
    trpc.notes.add.mutationOptions({
      onSuccess: async () => {
        form.reset();
        toast.success("Note added");
        await queryClient.invalidateQueries(trpc.notes.list.queryFilter());
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Notes demo</CardTitle>
        <CardDescription>
          Each note goes through tRPC + Zod into MongoDB (in-memory unless
          MONGODB_URI is set).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form
          className="flex items-start gap-2"
          onSubmit={form.handleSubmit((values) => addNote.mutate(values))}
        >
          <Controller
            name="text"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor={field.name} className="sr-only">
                  New note
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Write a note..."
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button type="submit" disabled={addNote.isPending}>
            {addNote.isPending ? "Adding..." : "Add"}
          </Button>
        </form>

        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search notes..."
          aria-label="Search notes"
        />

        {notes.isPending && <TableSkeleton columns={noteColumns} />}
        {notes.isError && (
          <p className="text-sm text-destructive">
            Could not load notes. Check the server logs.
          </p>
        )}
        {notes.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {search
              ? "No notes match your search."
              : "No notes yet. Add the first one."}
          </p>
        )}
        {notes.data && notes.data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                {noteColumns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.data.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="whitespace-normal">
                    {note.text}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
