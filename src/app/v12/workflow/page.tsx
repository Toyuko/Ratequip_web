"use client";

import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  v12ClaimTask,
  v12CompleteTask,
  v12ListWorkflow,
} from "@/lib/actions/v12";

type Template = { id: string; name: string; nodes: string[]; policy: string };
type Instance = {
  id: string;
  templateName: string;
  subjectType: string;
  subjectId: string;
  status: string;
  currentNode: string;
  startedBy: string;
};
type Task = {
  id: string;
  instanceId: string;
  node: string;
  status: string;
  claimedBy?: string;
};

export default function WorkflowPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [actor, setActor] = useState("manager@demo.ratequip.com");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const reload = () =>
    startTransition(async () => {
      const data = await v12ListWorkflow();
      setTemplates(data.templates);
      setInstances(data.instances);
      setTasks(data.tasks);
    });

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Release 3A</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Workflow engine
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12 Domain 37 / ADR-0023–0024 — configuration-driven approvals with
        human tasks and no self-approval. New requisitions start{" "}
        <code className="text-xs">wf-procurement-approval-v1</code>.
      </p>

      <div className="mt-6 max-w-sm">
        <Label htmlFor="actor">Acting as</Label>
        <Input
          id="actor"
          className="mt-1"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
        />
      </div>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Templates
      </h2>
      <ul className="mt-3 space-y-2">
        {templates.map((t) => (
          <li
            key={t.id}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-3 text-sm"
          >
            <div className="font-medium text-[var(--rq-ink)]">{t.name}</div>
            <div className="mt-1 text-[var(--rq-muted)]">
              {t.nodes.join(" → ")}
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Open tasks
      </h2>
      <ul className="mt-3 space-y-3">
        {tasks.filter((t) => t.status !== "completed").length === 0 ? (
          <li className="text-sm text-[var(--rq-muted)]">
            No open tasks. Submit a requisition to start one.
          </li>
        ) : (
          tasks
            .filter((t) => t.status !== "completed")
            .map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-[var(--rq-ink)]">
                    {t.node}
                  </span>
                  <Badge variant="muted">{t.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--rq-muted)]">
                  Instance {t.instanceId}
                  {t.claimedBy ? ` · claimed by ${t.claimedBy}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await v12ClaimTask({
                          taskId: t.id,
                          actor,
                        });
                        setMessage(
                          res.ok ? `Claimed ${t.node}` : res.message,
                        );
                        reload();
                      })
                    }
                  >
                    Claim
                  </Button>
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await v12CompleteTask({
                          taskId: t.id,
                          actor,
                        });
                        setMessage(
                          res.ok ? `Completed ${t.node}` : res.message,
                        );
                        reload();
                      })
                    }
                  >
                    Complete
                  </Button>
                </div>
              </li>
            ))
        )}
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Instances
      </h2>
      <ul className="mt-3 space-y-2">
        {instances.map((i) => (
          <li
            key={i.id}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-3 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-[var(--rq-ink)]">
                {i.templateName}
              </span>
              <Badge variant={i.status === "completed" ? "success" : "muted"}>
                {i.status}
              </Badge>
            </div>
            <p className="mt-1 text-[var(--rq-muted)]">
              {i.subjectType} {i.subjectId} · node {i.currentNode} · started by{" "}
              {i.startedBy}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
