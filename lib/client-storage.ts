"use client";

const DB_NAME = "projectasobi-client-storage";
const STORE_NAME = "keyval";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase | null> | null = null;

function canUseWindow() {
  return typeof window !== "undefined";
}

function getLocalStorageItem(key: string): { ok: boolean; value: string | null } {
  if (!canUseWindow()) return { ok: false, value: null };

  try {
    return { ok: true, value: window.localStorage.getItem(key) };
  } catch {
    return { ok: false, value: null };
  }
}

function setLocalStorageItem(key: string, value: string): boolean {
  if (!canUseWindow()) return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (!canUseWindow() || !("indexedDB" in window)) return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  return dbPromise;
}

async function getIndexedDbItem(key: string): Promise<string | null> {
  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(typeof result === "string" ? result : null);
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function setIndexedDbItem(key: string, value: string): Promise<boolean> {
  const db = await openDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function readClientJson<T>(key: string): Promise<T | null> {
  const local = getLocalStorageItem(key);
  if (local.ok && local.value !== null) {
    try {
      return JSON.parse(local.value) as T;
    } catch {
      return null;
    }
  }

  const indexedDbValue = await getIndexedDbItem(key);
  if (indexedDbValue === null) return null;

  if (local.ok) {
    setLocalStorageItem(key, indexedDbValue);
  }

  try {
    return JSON.parse(indexedDbValue) as T;
  } catch {
    return null;
  }
}

export async function writeClientJson(key: string, value: unknown): Promise<boolean> {
  const serialized = JSON.stringify(value);

  if (setLocalStorageItem(key, serialized)) {
    return true;
  }

  return setIndexedDbItem(key, serialized);
}
