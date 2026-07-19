import { del, put } from "@vercel/blob";

export async function uploadEvidence(
  file: File,
  pathname: string,
  access: "public" | "private" = "private",
): Promise<{ url: string; demo: boolean }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      url: `demo://evidence/${pathname}/${file.name}`,
      demo: true,
    };
  }

  const blob = await put(`evidence/${pathname}/${file.name}`, file, {
    access,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { url: blob.url, demo: false };
}

export type AccountMediaKind = "photo" | "video" | "document";

export async function uploadAccountMedia(
  file: File,
  opts: {
    companySlug: string;
    kind: AccountMediaKind;
    access?: "public" | "private";
  },
): Promise<{ url: string; demo: boolean }> {
  const access = opts.access ?? "public";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const pathname = `accounts/${opts.companySlug}/${opts.kind}/${Date.now().toString(36)}-${safeName}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      url: `demo://${pathname}`,
      demo: true,
    };
  }

  const blob = await put(pathname, file, {
    access,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { url: blob.url, demo: false };
}

export async function deleteBlobUrl(url: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  if (url.startsWith("demo://")) return;
  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (error) {
    console.warn("[blob] delete failed", error);
  }
}
