"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  removeCompanyMedia,
  uploadCompanyMedia,
} from "@/lib/actions/marketplace";
import type { AccountMediaKind } from "@/lib/blob";
import type { DemoCompanyMedia } from "@/lib/db/demo-data";

const KIND_LABELS: Record<AccountMediaKind, string> = {
  photo: "Photos",
  video: "Videos",
  document: "Documents",
};

const KIND_ACCEPT: Record<AccountMediaKind, string> = {
  photo: "image/*",
  video: "video/*",
  document:
    ".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const KIND_HINT: Record<AccountMediaKind, string> = {
  photo: "Images up to 10 MB",
  video: "Videos up to 100 MB",
  document: "PDF, Word, Excel, text, or images up to 25 MB",
};

function formatBytes(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPlayableUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function AccountMediaPanel({
  companySlug,
  media,
}: {
  companySlug: string;
  media: DemoCompanyMedia[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<AccountMediaKind>("photo");

  const grouped = {
    photo: media.filter((m) => m.kind === "photo"),
    video: media.filter((m) => m.kind === "video"),
    document: media.filter((m) => m.kind === "document"),
  };

  return (
    <section className="max-w-3xl space-y-6 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
      <div>
        <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
          Account media
        </h2>
        <p className="mt-1 text-sm text-[var(--rq-muted)]">
          Add photos, videos, and documents to your company account. These appear
          on your public profile.
        </p>
      </div>

      <form
        className="space-y-4 border-t border-[var(--rq-border)] pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);
          const file = fd.get("file") as File | null;
          const selectedKind = String(fd.get("kind")) as AccountMediaKind;
          startTransition(async () => {
            const result = await uploadCompanyMedia({
              companySlug,
              kind: selectedKind,
              file: file && file.size > 0 ? file : null,
              title: String(fd.get("title") || ""),
            });
            setMessage(result.message);
            if (result.ok) {
              form.reset();
              setKind("photo");
              router.refresh();
            }
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="media-kind">Type</Label>
            <select
              id="media-kind"
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as AccountMediaKind)}
              className="mt-1 flex h-10 w-full rounded-md border border-[var(--rq-border)] bg-white px-3 text-sm"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
            </select>
          </div>
          <div>
            <Label htmlFor="media-title">Title (optional)</Label>
            <Input id="media-title" name="title" className="mt-1" />
          </div>
        </div>
        <div>
          <Label htmlFor="media-file">File</Label>
          <Input
            id="media-file"
            name="file"
            type="file"
            accept={KIND_ACCEPT[kind]}
            required
            className="mt-1"
          />
          <p className="mt-1 text-xs text-[var(--rq-muted)]">{KIND_HINT[kind]}</p>
        </div>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Uploading…" : "Upload"}
        </Button>
      </form>

      {(["photo", "video", "document"] as const).map((sectionKind) => (
        <div key={sectionKind} className="border-t border-[var(--rq-border)] pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
            {KIND_LABELS[sectionKind]} ({grouped[sectionKind].length})
          </h3>
          {grouped[sectionKind].length === 0 ? (
            <p className="mt-2 text-sm text-[var(--rq-muted)]">None uploaded yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {grouped[sectionKind].map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-[var(--rq-border)] bg-white/60 p-3"
                >
                  <div className="min-w-0 flex-1">
                    {sectionKind === "photo" && isPlayableUrl(item.blobUrl) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.blobUrl}
                        alt={item.title}
                        className="mb-2 h-24 w-auto rounded object-cover"
                      />
                    ) : null}
                    {sectionKind === "video" && isPlayableUrl(item.blobUrl) ? (
                      <video
                        src={item.blobUrl}
                        controls
                        className="mb-2 max-h-36 w-full max-w-sm rounded"
                      />
                    ) : null}
                    <p className="truncate font-medium text-[var(--rq-ink)]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[var(--rq-muted)]">
                      {item.fileName}
                      {item.byteSize ? ` · ${formatBytes(item.byteSize)}` : ""}
                    </p>
                    {isPlayableUrl(item.blobUrl) ? (
                      <a
                        href={item.blobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs text-orange-600 hover:underline"
                      >
                        Open file
                      </a>
                    ) : (
                      <p className="mt-1 text-xs text-[var(--rq-muted)]">
                        Stored in demo mode (configure BLOB_READ_WRITE_TOKEN for live URLs).
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await removeCompanyMedia({
                          mediaId: item.id,
                          companySlug,
                        });
                        setMessage(result.message);
                        if (result.ok) router.refresh();
                      });
                    }}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}
