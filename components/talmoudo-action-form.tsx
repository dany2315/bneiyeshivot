"use client";

import {
  type ReactElement,
  type ReactNode,
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { TalmoudoActionState } from "@/app/admin/talmoudo-beyado/actions";

const initialState: TalmoudoActionState = { ok: false, message: "" };

export function TalmoudoDialogActionForm({
  action,
  children,
  className,
  description,
  submitLabel,
  title,
  trigger,
}: {
  action: (
    state: TalmoudoActionState,
    formData: FormData,
  ) => Promise<TalmoudoActionState>;
  children: ReactNode;
  className?: string;
  description?: string;
  submitLabel: string;
  title: string;
  trigger: ReactElement;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      formRef.current?.reset();
      window.setTimeout(() => setOpen(false), 0);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <form action={formAction} className="grid gap-4" ref={formRef}>
          {children}
          {pending ? <Progress value={66} /> : null}
          <Button disabled={pending} type="submit">
            {pending ? <Loader2 className="animate-spin" /> : null}
            {pending ? "Enregistrement..." : submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TalmoudoInlineActionForm({
  action,
  children,
  submitLabel,
}: {
  action: (
    state: TalmoudoActionState,
    formData: FormData,
  ) => Promise<TalmoudoActionState>;
  children: ReactNode;
  submitLabel: string;
}) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      startTransition(() => router.refresh());
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <form action={formAction} className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-4">
      {children}
      {pending || isRefreshing ? <Progress value={66} /> : null}
      <Button
        className="w-fit"
        disabled={pending || isRefreshing}
        type="submit"
        variant="secondary"
      >
        {pending || isRefreshing ? <Loader2 className="animate-spin" /> : null}
        {pending || isRefreshing ? "Enregistrement..." : submitLabel}
      </Button>
    </form>
  );
}

export function TalmoudoActionButton({
  action,
  children,
  fields,
  variant = "secondary",
}: {
  action: (
    state: TalmoudoActionState,
    formData: FormData,
  ) => Promise<TalmoudoActionState>;
  children: ReactNode;
  fields: Record<string, string>;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <form action={formAction}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} name={name} type="hidden" value={value} />
      ))}
      <Button
        className="w-full justify-start"
        disabled={pending}
        size="sm"
        type="submit"
        variant={variant}
      >
        {pending ? <Loader2 className="animate-spin" /> : null}
        {children}
      </Button>
    </form>
  );
}
