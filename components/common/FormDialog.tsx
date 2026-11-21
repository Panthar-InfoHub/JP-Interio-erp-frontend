"use client";

import { CircleAlert } from "lucide-react";
import type { FormEventHandler, ReactNode } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  submitLabel: string;
  pending?: boolean;
  /** The form's submit handler (e.g. react-hook-form's `handleSubmit(...)`). */
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** "md" for longer forms. */
  size?: "sm" | "md";
  destructive?: boolean;
  /**
   * A failure that belongs to no single field (e.g. a 409 name / code clash, DEC-268):
   * shown as a red box above the fields while the pop-up stays open.
   */
  formError?: string | null;
  children: ReactNode;
}

/**
 * A pop-up form (DEC-242): title, fields, Cancel / Save. The body scrolls on small
 * screens; it can't be closed while saving.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  pending = false,
  onSubmit,
  size = "sm",
  destructive = false,
  formError,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className={cn(size === "md" && "sm:max-w-lg")} showCloseButton={!pending}>
        <form noValidate onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          {formError ? (
            <Alert variant="destructive" className="border-destructive/40">
              <CircleAlert />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
          <div className="-mx-4 max-h-[60vh] overflow-y-auto px-4">{children}</div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={destructive ? "destructive" : "default"}
              disabled={pending}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
