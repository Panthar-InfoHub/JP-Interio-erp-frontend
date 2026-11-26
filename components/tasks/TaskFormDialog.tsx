"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FilterSelect } from "@/components/common/FilterSelect";
import { FormDialog } from "@/components/common/FormDialog";
import { PersonFilter } from "@/components/common/PersonFilter";
import { DueDateField } from "@/components/tasks/DueDateField";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PersonOption } from "@/hooks/data/usePeopleSearch";
import { useTaskActions, useTaskCategories } from "@/hooks/tasks/useTasks";
import { roleLabel } from "@/lib/auth/roles";
import type { Task, TaskPriority, TaskUpdate } from "@/lib/api/tasks.api";
import { todayInIndia } from "@/lib/format/istDay";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";
import { TASK_PRIORITY_LABELS } from "@/lib/labels/task";
import { assignableRoles } from "@/lib/tasks/taskRules";
import { useAuthStore } from "@/stores/auth.store";

/** Same limits as the server (backend task.schema.ts). */
const TITLE_MAX = 300;
const DESCRIPTION_MAX = 5000;
const CATEGORY_MAX = 100;
const OTHER = "__other__";

// Server field errors that have a visible field here; any other one goes in the red box.
const FIELDS = ["assignedToId", "title", "description", "dueDate"] as const;

const schema = z
  .object({
    assignedToId: z.string(),
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(TITLE_MAX, `At most ${TITLE_MAX} characters`),
    description: z.string().trim().max(DESCRIPTION_MAX, `At most ${DESCRIPTION_MAX} characters`),
    categoryChoice: z.string().min(1, "Choose a category"),
    category: z.string().trim().max(CATEGORY_MAX, `At most ${CATEGORY_MAX} characters`),
    priority: z.enum(["high", "medium", "low"]),
    dueDate: z.string().min(1, "Pick a due day"),
  })
  .refine((values) => values.categoryChoice !== OTHER || values.category.length > 0, {
    message: "Type the category",
    path: ["category"],
  });

type FormValues = z.infer<typeof schema>;

function startValues(task: Task | null): FormValues {
  return {
    assignedToId: task?.assignedTo?.id ?? "",
    title: task?.title ?? "",
    description: task?.description ?? "",
    // The current category is offered as a choice even when it isn't a suggestion.
    categoryChoice: task?.category ?? "",
    category: "",
    priority: task?.priority ?? "medium",
    dueDate: task?.dueDate ?? "",
  };
}

interface TaskFormDialogProps {
  /** null = give a new task; else edit this one (loaded in full). */
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Give a task or edit one (`tasks.assign`, DEC-291). Giving: person (only roles I may give
 * to), title, category (suggestion or "Other…"), priority, due day (today or later), details.
 * Editing: the same without the person; only changed fields are sent, and only a NEW due day
 * must be today or later. Send stays off while waiting (giving isn't retry-safe, DEC-180).
 * Refusals that belong to no field (wrong person, not active, locked task) show in the red
 * box (DEC-268). The caller mounts this only while open, so every opening starts fresh.
 */
export function TaskFormDialog({ task, open, onOpenChange }: TaskFormDialogProps) {
  const isEdit = task !== null;
  const myRole = useAuthStore((state) => state.user?.role.key);
  const initial = startValues(task);
  const categories = useTaskCategories();
  const { create, update } = useTaskActions();
  const pending = create.isPending || update.isPending;
  const [formError, setFormError] = useState<string | null>(null);
  const [person, setPerson] = useState<PersonOption | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial });
  const { errors } = form.formState;
  const categoryChoice = useWatch({ control: form.control, name: "categoryChoice" });

  const categoryOptions: Record<string, string> = Object.fromEntries(
    (categories.data ?? []).map((name) => [name, name]),
  );
  if (task && !(task.category in categoryOptions)) categoryOptions[task.category] = task.category;
  categoryOptions[OTHER] = "Other…";

  const onError = (error: unknown) => {
    const fields = applyServerFieldErrors(error, form.setError, FIELDS);
    if (!fields) setFormError(errorMessage(error));
  };
  const onDone = (message: string | undefined, fallback: string) => {
    toast.success(message ?? fallback);
    onOpenChange(false);
  };

  const save = form.handleSubmit((values) => {
    setFormError(null);
    const category = values.categoryChoice === OTHER ? values.category : values.categoryChoice;
    const dueChanged = values.dueDate !== initial.dueDate;
    // The clock is read here (on submit), never while drawing.
    if (dueChanged && values.dueDate < todayInIndia()) {
      form.setError("dueDate", { message: "The due day can't be in the past" });
      return;
    }

    if (!isEdit) {
      if (!values.assignedToId) {
        form.setError("assignedToId", { message: "Choose who will do it" });
        return;
      }
      create.mutate(
        {
          assignedToId: values.assignedToId,
          title: values.title,
          ...(values.description ? { description: values.description } : {}),
          category,
          priority: values.priority,
          dueDate: values.dueDate,
        },
        { onSuccess: (reply) => onDone(reply.message, "Task given"), onError },
      );
      return;
    }

    const changes: TaskUpdate = {};
    if (values.title !== initial.title) changes.title = values.title;
    if (values.description !== initial.description)
      changes.description = values.description || null;
    if (category !== task.category) changes.category = category;
    if (values.priority !== initial.priority) changes.priority = values.priority;
    if (dueChanged) changes.dueDate = values.dueDate;
    if (Object.keys(changes).length === 0) {
      toast.info("Nothing changed");
      onOpenChange(false);
      return;
    }
    update.mutate(
      { id: task.id, changes },
      { onSuccess: (reply) => onDone(reply.message, "Task updated"), onError },
    );
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit task" : "Give a task"}
      description={
        isEdit
          ? "The person doing it can't be changed. Completed or cancelled tasks are locked."
          : "Only the person you choose can start and complete it, with photos."
      }
      submitLabel={isEdit ? "Save changes" : "Give task"}
      pending={pending}
      onSubmit={save}
      formError={formError}
      size="md"
    >
      <FieldGroup>
        {isEdit ? (
          <Field>
            <FieldLabel>Given to</FieldLabel>
            <p className="text-sm">
              {task.assignedTo?.name ?? "Unnamed"}
              {task.assignedTo ? (
                <span className="text-muted-foreground">
                  {" "}
                  · {roleLabel(task.assignedTo.role)}
                  {task.zone ? ` · ${task.zone.name}` : ""}
                </span>
              ) : null}
            </p>
          </Field>
        ) : (
          <Field data-invalid={Boolean(errors.assignedToId)}>
            <FieldLabel htmlFor="task-person">Give to</FieldLabel>
            <Controller
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <PersonFilter
                  id="task-person"
                  kind="staff"
                  roles={assignableRoles(myRole)}
                  value={field.value || null}
                  valueLabel={person?.name ?? "Unnamed"}
                  onChange={(next) => {
                    setPerson(next);
                    field.onChange(next?.id ?? "");
                  }}
                  zoneId={null}
                  placeholder="Choose a person"
                  clearable={false}
                  invalid={Boolean(errors.assignedToId)}
                  className="w-full"
                />
              )}
            />
            {person ? (
              <FieldDescription>
                {roleLabel(person.role)}
                {person.zoneName ? ` · ${person.zoneName}` : ""}
              </FieldDescription>
            ) : null}
            <FieldError errors={[errors.assignedToId]} />
          </Field>
        )}

        <Field data-invalid={Boolean(errors.title)}>
          <FieldLabel htmlFor="task-title">Title</FieldLabel>
          <Input
            id="task-title"
            aria-invalid={Boolean(errors.title)}
            autoComplete="off"
            maxLength={TITLE_MAX}
            placeholder="e.g. Visit Sharma Hardware"
            {...form.register("title")}
          />
          <FieldError errors={[errors.title]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.categoryChoice)}>
            <FieldLabel>Category</FieldLabel>
            <Controller
              control={form.control}
              name="categoryChoice"
              render={({ field }) => (
                <FilterSelect
                  label="Category"
                  value={field.value || null}
                  onChange={(next) => field.onChange(next ?? "")}
                  options={categoryOptions}
                  allLabel={categories.isPending ? "Loading…" : "Choose a category"}
                  className="w-full"
                />
              )}
            />
            <FieldError errors={[errors.categoryChoice]} />
          </Field>

          <Field>
            <FieldLabel>Priority</FieldLabel>
            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => (
                <Select
                  value={field.value}
                  items={TASK_PRIORITY_LABELS}
                  onValueChange={(next) => next && field.onChange(next as TaskPriority)}
                >
                  <SelectTrigger className="w-full" aria-label="Priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>

        {categoryChoice === OTHER ? (
          <Field data-invalid={Boolean(errors.category)}>
            <FieldLabel htmlFor="task-category">New category</FieldLabel>
            <Input
              id="task-category"
              aria-invalid={Boolean(errors.category)}
              autoComplete="off"
              maxLength={CATEGORY_MAX}
              placeholder="e.g. Site measurement"
              {...form.register("category")}
            />
            <FieldError errors={[errors.category]} />
          </Field>
        ) : null}

        <Field data-invalid={Boolean(errors.dueDate)}>
          <FieldLabel htmlFor="task-due">Due day</FieldLabel>
          <Controller
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <DueDateField
                id="task-due"
                value={field.value}
                onChange={field.onChange}
                invalid={Boolean(errors.dueDate)}
              />
            )}
          />
          {task?.escalatedAt ? (
            <FieldDescription>
              A new due date removes the Flagged mark; it is flagged again if the new date also
              passes.
            </FieldDescription>
          ) : null}
          <FieldError errors={[errors.dueDate]} />
        </Field>

        <Field data-invalid={Boolean(errors.description)}>
          <FieldLabel htmlFor="task-description">Details (optional)</FieldLabel>
          <Textarea
            id="task-description"
            aria-invalid={Boolean(errors.description)}
            rows={4}
            maxLength={DESCRIPTION_MAX}
            placeholder="What exactly should be done?"
            {...form.register("description")}
          />
          <FieldError errors={[errors.description]} />
        </Field>
      </FieldGroup>
    </FormDialog>
  );
}
