import { useEffect, useState } from "react";
import { openDB } from "idb";

export default function useDownloadedKeys() {
  const [downloadedKeys, setDownloadedKeys] = useState<Set<string>>(new Set());
  const db = openDB("studyconnect-offline-v1", 2).then((db) => db);  

  useEffect(() => {
    (async () => {
      const db = await openDB("studyconnect-offline-v1", 2, {
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
      const allKeys = await store.getAllKeys();
      setDownloadedKeys(new Set(allKeys as string[]));
    })();
  }, [db]);

  return downloadedKeys;
}