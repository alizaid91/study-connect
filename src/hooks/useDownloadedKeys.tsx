import { useEffect, useState } from "react";
import { openDB, IDBPDatabase } from "idb";

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("studyconnect-offline-v1", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files");
        }
        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata");
        }
      },
    });
  }
  return dbPromise;
}

const getDownloadedKeys = async () => {
  const db = await getDB();
  const tx = db.transaction("metadata", "readonly");
  const store = tx.objectStore("metadata");
  const allKeys = await store.getAllKeys();
  return new Set(allKeys as string[]);
};

export { getDownloadedKeys };
