"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateMe } from "@/hooks/auth/useUpdateMe";
import { isApiError } from "@/lib/api/errors";

// Same limits as the server (docs/api/users.openapi.yaml, PATCH /users/me).
const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100, "At most 100 characters."),
  email: z.union([z.literal(""), z.email("Enter a valid email address.")]),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  name: string;
  email: string | null;
  onDone: () => void;
}

export function ProfileEditForm({ name, email, onDone }: ProfileEditFormProps) {
  const updateMe = useUpdateMe();
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name, email: email ?? "" },
  });
  const { errors } = form.formState;

  const save = form.handleSubmit((values) => {
    updateMe.mutate(
      { name: values.name.trim(), email: values.email.trim() === "" ? null : values.email.trim() },
      {
        onSuccess: (reply) => {
          toast.success(reply.message ?? "Profile saved");
          onDone();
        },
        onError: (error) => {
          // An email that belongs to someone else comes back as 409.
          if (isApiError(error) && error.status === 409) {
            form.setError("email", { message: error.message });
          } else {
            toast.error(isApiError(error) ? error.message : "Could not save. Please try again.");
          }
        },
      },
    );
  });

  return (
    <form noValidate onSubmit={save} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="profile-name">Name</FieldLabel>
          <Input
            id="profile-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="profile-email">Email (optional)</FieldLabel>
          <Input
            id="profile-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
      </FieldGroup>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={updateMe.isPending}>
          {updateMe.isPending ? <Spinner data-icon="inline-start" /> : null}
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={updateMe.isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
