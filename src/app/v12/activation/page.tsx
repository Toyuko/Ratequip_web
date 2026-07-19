"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { v12ResolveQuestions, v12SaveAnswers } from "@/lib/actions/v12";

const roles = [
  { id: "buyer", pack: "role.buyer", label: "Buyer" },
  { id: "supplier", pack: "role.supplier", label: "Supplier" },
  { id: "contractor", pack: "role.contractor", label: "Contractor" },
] as const;

type Resolved = {
  id: string;
  prompt?: string;
  required: boolean;
  options?: Array<string | { value: string; label: string }>;
  input_type?: string;
  answer_type?: string;
};

export default function ActivationPage() {
  const [role, setRole] = useState<(typeof roles)[number]["id"]>("buyer");
  const [step, setStep] = useState<"universal" | "role">("universal");
  const [questions, setQuestions] = useState<Resolved[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const packId = useMemo(
    () => (step === "universal" ? "universal" : roles.find((r) => r.id === role)!.pack),
    [role, step],
  );

  function loadPack() {
    startTransition(async () => {
      const result = await v12ResolveQuestions({
        packId,
        roles: [role],
        answers,
        jurisdiction: "AU",
      });
      setQuestions(result.questions as Resolved[]);
      setMessage(
        `Resolved ${result.questions.length} questions from pack “${result.packId}” (${result.policyVersion}).`,
      );
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        Activation — Dynamic Question Engine
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12 Domain 07: versioned packs with conditional visibility. No generic
        first dashboard — answers drive the next relevant workspace.
      </p>

      <div className="mt-8 space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
        <div>
          <Label>Role context</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {roles.map((r) => (
              <Button
                key={r.id}
                type="button"
                size="sm"
                variant={role === r.id ? "default" : "outline"}
                onClick={() => setRole(r.id)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Label>Pack</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={step === "universal" ? "default" : "outline"}
              onClick={() => setStep("universal")}
            >
              universal
            </Button>
            <Button
              type="button"
              size="sm"
              variant={step === "role" ? "default" : "outline"}
              onClick={() => setStep("role")}
            >
              {roles.find((r) => r.id === role)!.pack}
            </Button>
          </div>
        </div>
        <Button type="button" disabled={pending} onClick={loadPack}>
          {pending ? "Resolving…" : "Resolve question set"}
        </Button>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      </div>

      {questions.length > 0 ? (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              await v12SaveAnswers(`activation-${role}`, answers);
              setMessage("Answers saved. Continue to opportunity/contractor builders or matching.");
            });
          }}
        >
          {questions.map((q) => {
            const opts = (q.options ?? []).map((o) =>
              typeof o === "string"
                ? { value: o, label: o.replace(/_/g, " ") }
                : o,
            );
            return (
              <div
                key={q.id}
                className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
              >
                <Label>
                  {q.prompt ?? q.id}
                  {q.required ? " *" : ""}
                </Label>
                {opts.length > 0 ? (
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-[var(--rq-border)] bg-white px-3 text-sm"
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    required={q.required}
                  >
                    <option value="">Select…</option>
                    {opts.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-[var(--rq-border)] bg-white px-3 text-sm"
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    required={q.required}
                  />
                )}
              </div>
            );
          })}
          <Button type="submit" disabled={pending}>
            Save answers
          </Button>
        </form>
      ) : null}
    </div>
  );
}
