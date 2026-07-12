"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/lib/actions/marketplace";

export default function NewProjectPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-navy)]">New project</h1>
      <p className="mt-2 text-slate-600">
        Create a lightweight workspace to group RFQs, quotes and documents.
      </p>
      <form
        className="mt-8 space-y-4 rounded-lg border border-[var(--rq-border)] bg-white p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const result = await createProject({
              name: String(fd.get("name")),
              summary: String(fd.get("summary")),
            });
            setMessage(result.message);
            if (result.ok && result.id) {
              router.push(`/workspaces/${result.id}`);
            }
          });
        }}
      >
        <div>
          <Label htmlFor="name">Project name</Label>
          <Input id="name" name="name" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" name="summary" className="mt-1" />
        </div>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create project"}
        </Button>
      </form>
    </div>
  );
}
