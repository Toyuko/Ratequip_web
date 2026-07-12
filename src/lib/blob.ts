import { put } from "@vercel/blob";

export async function uploadEvidence(
  file: File,
  pathname: string,
): Promise<{ url: string; demo: boolean }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      url: `demo://evidence/${pathname}/${file.name}`,
      demo: true,
    };
  }

  const blob = await put(`evidence/${pathname}/${file.name}`, file, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { url: blob.url, demo: false };
}
