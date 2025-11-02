import { openDB, IDBPDatabase } from "idb";

interface Idea {
  _id?: number;
  title: string;
  description: string;
}

const DB_NAME = "ideas-app";
const STORE_NAME = "ideas";
const DB_VERSION = 1;

export async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "_id", autoIncrement: true });
      }
    },
  });
}

export async function saveIdea(idea: Idea): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, idea);
}

export async function getAllIdeas(): Promise<Idea[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function deleteIdea(id: number): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

export async function clearIdeas(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE_NAME);
}
