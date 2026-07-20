"use client";

import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  v12ConfirmCompanySetup,
  v12ListCompanySetup,
  v12ListSetupIndustryPacks,
  v12ReviewCompanySetupSuggestions,
  v12ReviewProfileCompanySuggestion,
  v12SaveCompanySetupSection,
  v12StartCompanySetup,
} from "@/lib/actions/v12";

type Role = "buyer" | "supplier" | "contractor";

type Question = {
  id: string;
  prompt: string;
  required: boolean;
  inputType: "text" | "textarea" | "single_select" | "multi_select";
  options?: Array<{ value: string; label: string }>;
  whyAsked: string;
};

type Section = {
  id: string;
  label: string;
  description: string;
  questions: Question[];
};

type Suggestion = {
  id: string;
  label: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
};

type CompanySuggestion = {
  id: string;
  companySlug: string;
  companyName: string;
  headline: string;
  city: string;
  country: string;
  categories: string[];
  trustScore: number;
  verified: boolean;
  rank: number;
  score: number;
  reasons: string[];
  badge: "trusted_supplier" | "strong_fit" | "relevant";
  status: "suggested" | "saved" | "dismissed";
};

type Session = {
  id: string;
  companyName: string;
  role: Role;
  industryPack: string;
  status: "in_progress" | "review" | "completed";
  sectionIndex: number;
  sections: Section[];
  answers: Record<string, string>;
  suggestions: Suggestion[];
  companySuggestions: CompanySuggestion[];
  profileId?: string;
};

const roles: Array<{ id: Role; title: string; body: string }> = [
  {
    id: "buyer",
    title: "Buyer",
    body: "I source equipment, run RFQs, and award suppliers.",
  },
  {
    id: "supplier",
    title: "Supplier",
    body: "I manufacture or distribute equipment and want to be matched.",
  },
  {
    id: "contractor",
    title: "Contractor",
    body: "I install, maintain, validate or support industrial systems.",
  },
];

function CompanySetupWizard() {
  const searchParams = useSearchParams();
  const presetName = searchParams.get("company") ?? "";
  const presetRole = (searchParams.get("role") as Role | null) ?? "buyer";

  const [phase, setPhase] = useState<"start" | "interview" | "review" | "done">(
    "start",
  );
  const [companyName, setCompanyName] = useState(presetName);
  const [role, setRole] = useState<Role>(
    ["buyer", "supplier", "contractor"].includes(presetRole)
      ? presetRole
      : "buyer",
  );
  const [industryPack, setIndustryPack] = useState("pet_food");
  const [packs, setPacks] = useState<
    Array<{ id: string; label: string; adjacentCount: number }>
  >([]);
  const [session, setSession] = useState<Session | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [companySuggestions, setCompanySuggestions] = useState<
    CompanySuggestion[]
  >([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (presetName) setCompanyName(presetName);
  }, [presetName]);

  useEffect(() => {
    startTransition(async () => {
      const [packList, existing] = await Promise.all([
        v12ListSetupIndustryPacks(),
        v12ListCompanySetup(),
      ]);
      setPacks(packList);
      if (packList[0] && !packList.some((p) => p.id === industryPack)) {
        setIndustryPack(packList[0].id);
      }
      if (existing.session && existing.session.status !== "completed") {
        setSession(existing.session as Session);
        setAnswers(existing.session.answers);
        setCompanySuggestions(
          (existing.session as Session).companySuggestions ?? [],
        );
        setPhase(
          existing.session.status === "review" ? "review" : "interview",
        );
      } else if (
        existing.session?.status === "completed" &&
        (existing.session as Session).companySuggestions?.length
      ) {
        setSession(existing.session as Session);
        setCompanySuggestions(
          (existing.session as Session).companySuggestions,
        );
        setPhase("done");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentSection = useMemo(() => {
    if (!session || session.status !== "in_progress") return null;
    return session.sections[session.sectionIndex] ?? null;
  }, [session]);

  const progress = useMemo(() => {
    if (!session) return 0;
    if (session.status === "completed") return 100;
    if (session.status === "review") return 92;
    return Math.round(
      (session.sectionIndex / Math.max(session.sections.length, 1)) * 90,
    );
  }, [session]);

  function startWizard() {
    startTransition(async () => {
      const res = await v12StartCompanySetup({
        companyName,
        role,
        industryPack,
      });
      if (!res.ok) {
        setMessage(res.message);
        return;
      }
      setSession(res.session as Session);
      setAnswers({});
      setPhase("interview");
      setMessage(
        `AI interview started · ${res.session.sections.length} sections · ${res.policyVersion}`,
      );
    });
  }

  function saveSection() {
    if (!session || !currentSection) return;
    const missing = currentSection.questions.filter(
      (q) => q.required && !(answers[q.id] ?? "").trim(),
    );
    if (missing.length > 0) {
      setMessage(`Please answer: ${missing[0]!.prompt}`);
      return;
    }
    startTransition(async () => {
      const res = await v12SaveCompanySetupSection({
        sessionId: session.id,
        answers,
        advance: true,
      });
      if (!res.ok) {
        setMessage(res.message);
        return;
      }
      setSession(res.session as Session);
      setAnswers(res.session.answers);
      if (res.session.status === "review") {
        setPhase("review");
        setMessage(
          "Interview complete. Review AI suggestions before confirming the company profile.",
        );
      } else {
        setMessage(`Saved. Next: ${res.currentSection?.label ?? "review"}`);
      }
    });
  }

  function setSuggestion(id: string, status: "accepted" | "rejected") {
    if (!session) return;
    startTransition(async () => {
      const res = await v12ReviewCompanySetupSuggestions({
        sessionId: session.id,
        decisions: [{ id, status }],
      });
      if (!res.ok) {
        setMessage(res.message);
        return;
      }
      setSession(res.session as Session);
    });
  }

  function confirmProfile() {
    if (!session) return;
    startTransition(async () => {
      const res = await v12ConfirmCompanySetup({
        sessionId: session.id,
        confirmedBy: "company-admin@demo.ratequip.com",
      });
      if (!res.ok) {
        setMessage(res.message);
        return;
      }
      setSession(res.session as Session);
      setCompanySuggestions(res.companySuggestions ?? []);
      setPhase("done");
      setMessage(
        `Company profile confirmed. ${res.acceptedSuggestions} suggestion(s) accepted · ${res.companySuggestions?.length ?? 0} companies matched.`,
      );
    });
  }

  function markCompany(suggestionId: string, status: "saved" | "dismissed") {
    if (!session?.profileId) return;
    startTransition(async () => {
      const res = await v12ReviewProfileCompanySuggestion({
        profileId: session.profileId!,
        suggestionId,
        status,
      });
      if (!res.ok) {
        setMessage(res.message);
        return;
      }
      setCompanySuggestions(res.profile.companySuggestions);
      setSession((prev) =>
        prev
          ? {
              ...prev,
              companySuggestions: res.profile.companySuggestions,
            }
          : prev,
      );
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Company setup</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Set up your company with AI
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        RateQuip asks a guided set of questions about your role, industry and
        operating profile. Suggestions stay pending until you accept or reject
        them — nothing is published from inference alone.
      </p>

      {session ? (
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs text-[var(--rq-muted)]">
            <span>
              {session.companyName} · {session.role} ·{" "}
              {session.industryPack.replace(/_/g, " ")}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--rq-border)]">
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="mt-4 text-sm text-emerald-800">{message}</p>
      ) : null}

      {phase === "start" ? (
        <div className="mt-8 space-y-5 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
          <div>
            <Label htmlFor="company">Company name</Label>
            <Input
              id="company"
              className="mt-1"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Packaging Pty Ltd"
            />
          </div>

          <div>
            <Label>Your role</Label>
            <div className="mt-2 grid gap-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`rounded-md border p-3 text-left ${
                    role === r.id
                      ? "border-orange-400 bg-orange-50"
                      : "border-[var(--rq-border)]"
                  }`}
                >
                  <div className="font-medium text-[var(--rq-ink)]">
                    {r.title}
                  </div>
                  <div className="text-sm text-[var(--rq-slate)]">{r.body}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Industry interview pack</Label>
            <select
              className="mt-1 h-11 w-full rounded-md border border-[var(--rq-border)] bg-white px-3 text-sm"
              value={industryPack}
              onChange={(e) => setIndustryPack(e.target.value)}
            >
              {packs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.adjacentCount} adjacency hints)
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--rq-muted)]">
              Packs come from Part 5 Domain 75 — Business Operating Profile.
            </p>
          </div>

          <Button
            type="button"
            disabled={pending || !companyName.trim()}
            onClick={startWizard}
          >
            {pending ? "Starting…" : "Start AI interview"}
          </Button>
        </div>
      ) : null}

      {phase === "interview" && currentSection ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
            <p className="text-sm font-medium text-orange-700">
              AI assistant · section {(session?.sectionIndex ?? 0) + 1} of{" "}
              {session?.sections.length ?? 0}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--rq-ink)]">
              {currentSection.label}
            </h2>
            <p className="mt-1 text-sm text-[var(--rq-slate)]">
              {currentSection.description}
            </p>
          </div>

          {currentSection.questions.map((q) => (
            <div
              key={q.id}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
            >
              <Label>
                {q.prompt}
                {q.required ? " *" : ""}
              </Label>
              <p className="mt-1 text-xs text-[var(--rq-muted)]">{q.whyAsked}</p>
              {q.inputType === "single_select" && q.options?.length ? (
                <select
                  className="mt-2 h-11 w-full rounded-md border border-[var(--rq-border)] bg-white px-3 text-sm"
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  required={q.required}
                >
                  <option value="">Select…</option>
                  {q.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : q.inputType === "text" ? (
                <Input
                  className="mt-2"
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              ) : (
                <Textarea
                  className="mt-2 min-h-24"
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  placeholder="Type your answer — or write unknown if you do not know yet"
                />
              )}
            </div>
          ))}

          <Button type="button" disabled={pending} onClick={saveSection}>
            {pending ? "Saving…" : "Continue"}
          </Button>
        </div>
      ) : null}

      {phase === "review" && session ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
            <h2 className="text-xl font-semibold text-[var(--rq-ink)]">
              Review AI suggestions
            </h2>
            <p className="mt-1 text-sm text-[var(--rq-slate)]">
              These come from your industry pack and stated goals. Accept only
              what is true for your company.
            </p>
          </div>

          {session.suggestions.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-[var(--rq-ink)]">
                    {s.label}
                  </div>
                  <p className="mt-1 text-sm text-[var(--rq-slate)]">
                    {s.reason}
                  </p>
                  <Badge
                    className="mt-2"
                    variant={
                      s.status === "accepted"
                        ? "default"
                        : s.status === "rejected"
                          ? "muted"
                          : "warning"
                    }
                  >
                    {s.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={s.status === "accepted" ? "default" : "outline"}
                    disabled={pending}
                    onClick={() => setSuggestion(s.id, "accepted")}
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={s.status === "rejected" ? "default" : "outline"}
                    disabled={pending}
                    onClick={() => setSuggestion(s.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" disabled={pending} onClick={confirmProfile}>
            {pending ? "Confirming…" : "Confirm company operating profile"}
          </Button>
        </div>
      ) : null}

      {phase === "done" && session ? (
        <div className="mt-8 space-y-6">
          <div className="space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
            <h2 className="text-xl font-semibold text-[var(--rq-ink)]">
              {session.companyName} is ready
            </h2>
            <p className="text-sm text-[var(--rq-slate)]">
              Operating profile saved. Based on your answers, RateQuip ranked
              trusted and relevant companies on the marketplace — review them
              before you reach out.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/v12/opportunity-builder">
                  Buyer / supplier profile
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/v12/matching">Open matching</Link>
              </Button>
              <Button asChild variant="outline">
                <Link
                  href={`/dashboard/${session.role === "contractor" ? "contractor" : session.role}`}
                >
                  Open dashboard
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[var(--rq-ink)]">
              Suggested companies for your profile
            </h3>
            <p className="mt-1 text-sm text-[var(--rq-slate)]">
              Ranked by industry fit, adjacency to your operating profile, and
              trust score. Save ones you want to explore.
            </p>
            {companySuggestions.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--rq-muted)]">
                No marketplace matches yet — try matching after you publish more
                profile detail.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {companySuggestions.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/companies/${c.companySlug}`}
                            className="font-semibold text-orange-700 hover:underline"
                          >
                            {c.rank}. {c.companyName}
                          </Link>
                          <Badge
                            variant={
                              c.badge === "trusted_supplier"
                                ? "success"
                                : c.badge === "strong_fit"
                                  ? "orange"
                                  : "muted"
                            }
                          >
                            {c.badge === "trusted_supplier"
                              ? "Trusted supplier"
                              : c.badge === "strong_fit"
                                ? "Strong fit"
                                : "Relevant"}
                          </Badge>
                          {c.verified ? (
                            <Badge variant="default">Verified</Badge>
                          ) : null}
                          <Badge variant="muted">
                            Trust {Math.round(c.trustScore)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-[var(--rq-slate)]">
                          {c.headline}
                        </p>
                        <p className="mt-1 text-xs text-[var(--rq-muted)]">
                          {[c.city, c.country].filter(Boolean).join(", ")}
                          {c.categories.length
                            ? ` · ${c.categories.slice(0, 3).join(", ")}`
                            : ""}
                          {` · score ${c.score}`}
                        </p>
                        <p className="mt-2 text-xs text-[var(--rq-muted)]">
                          Why suggested:{" "}
                          {c.reasons
                            .slice(0, 4)
                            .map((r) => r.replace(/_/g, " "))
                            .join(" · ")}
                        </p>
                        {c.status !== "suggested" ? (
                          <Badge className="mt-2" variant="warning">
                            {c.status}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/companies/${c.companySlug}`}>
                            View
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending || c.status === "saved"}
                          onClick={() => markCompany(c.id, "saved")}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pending || c.status === "dismissed"}
                          onClick={() => markCompany(c.id, "dismissed")}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CompanySetupWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-12 text-[var(--rq-muted)]">
          Loading company setup…
        </div>
      }
    >
      <CompanySetupWizard />
    </Suspense>
  );
}
