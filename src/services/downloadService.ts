import { openDB } from "idb";

async function storeDownload(
  fileKey: string,
  encryptedPdf: ArrayBuffer,
  metadata: any
) {
  const db = await openDB("studyconnect-offline-v1", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files");
      }
      if (!db.objectStoreNames.contains("metadata")) {
        db.createObjectStore("metadata");
      }
    },
  });

  await db.put("files", encryptedPdf, fileKey);
  await db.put("metadata", metadata, fileKey);
}

async function openDownloadedPdf(fileKey: string) {
  const db = await openDB("studyconnect-offline-v1", 1);
  const metadata = await db.get("metadata", fileKey);
  const pdf = await db.get("files", fileKey);

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  return { url, metadata };
}

export const downloadService = {
  storeDownload,
  openDownloadedPdf,
};
