import { useEffect, useState } from "react";
import { openDB } from "idb";

export default function useDownloadedKeys() {
  const [downloadedKeys, setDownloadedKeys] = useState<Set<string>>(new Set());
  let testDb = null;  

  useEffect(() => {
    (async () => {
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

      const tx = db.transaction("metadata", "readonly");
      const store = tx.objectStore("metadata");
      testDb = db;
      const allKeys = await store.getAllKeys();
      setDownloadedKeys(new Set(allKeys as string[]));
    })();
  }, [testDb]);

  return downloadedKeys;
}