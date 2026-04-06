import { type Actor } from "@/types/actor";

export interface LibraryEntry {
  id: string;
  name: string;
  handle?: FileSystemFileHandle;
  lastModified: number;
  actor: Actor;
}

const DB_NAME = "rpg-character-creator";
const STORE_NAME = "library";
const HANDLES_STORE = "handles";
const DB_VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(HANDLES_STORE)) {
        db.createObjectStore(HANDLES_STORE);
      }
    };
  });
}

export async function saveToLibrary(entry: LibraryEntry): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(entry);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getLibrary(): Promise<LibraryEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveHandle(path: string, handle: FileSystemHandle): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, "readwrite");
    const store = transaction.objectStore(HANDLES_STORE);
    const request = store.put(handle, path);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getHandle(path: string): Promise<FileSystemHandle | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, "readonly");
    const store = transaction.objectStore(HANDLES_STORE);
    const request = store.get(path);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function getAllHandles(): Promise<Record<string, FileSystemHandle>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, "readonly");
    const store = transaction.objectStore(HANDLES_STORE);
    const request = store.getAll();
    const keysRequest = store.getAllKeys();
    
    transaction.oncomplete = () => {
      const results: Record<string, FileSystemHandle> = {};
      const values = request.result;
      const keys = keysRequest.result;
      for (let i = 0; i < keys.length; i++) {
        results[keys[i] as string] = values[i];
      }
      resolve(results);
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function removeFromLibrary(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function verifyPermission(handle: FileSystemFileHandle, readWrite: boolean): Promise<boolean> {
  const options: FileSystemHandlePermissionDescriptor = {};
  if (readWrite) {
    options.mode = "readwrite";
  }
  // Check if permission was already granted. If so, return true.
  if ((await handle.queryPermission(options)) === "granted") {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await handle.requestPermission(options)) === "granted") {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}
