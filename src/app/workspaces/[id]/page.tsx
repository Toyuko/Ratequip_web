import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getProjectById, listRequests } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);
  return { title: project?.name ?? "Workspace" };
}

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const existing = getProjectById(id);
  if (!existing && !id.startsWith("proj-") && !id.startsWith("proj-demo-")) {
    notFound();
  }

  const project = existing ?? {
    id,
    name: "New project workspace",
    slug: id,
    summary: "Demo workspace created in this session.",
    status: "active",
    memberCount: 1,
  };

  const linkedRequests = listRequests().slice(0, 2);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Badge variant="success">{project.status}</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        {project.name}
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">{project.summary}</p>
      <p className="mt-1 text-sm text-[var(--rq-muted)]">
        {project.memberCount} members
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Linked RFQs
        </h2>
        <ul className="mt-4 space-y-3">
          {linkedRequests.map((r) => (
            <li key={r.id}>
              <Link
                href={`/requests/${r.id}`}
                className="block rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 hover:border-orange-300"
              >
                <div className="font-medium text-[var(--rq-ink)]">{r.title}</div>
                <div className="text-sm text-[var(--rq-muted)]">
                  {r.quoteCount} quotes · {r.status}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">Notes</h2>
        <div className="mt-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 text-sm text-[var(--rq-slate)]">
          Workspace lite: attach RFQs, quotes and evidence documents here.
          Messaging arrives in Phase 3.
        </div>
      </section>
    </div>
  );
}
