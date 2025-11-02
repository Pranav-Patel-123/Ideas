import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "ideas-app";
const STORE_NAME = "ideas";
const DB_VERSION = 1;

/**
 * Represents a single idea object
 */
export interface Idea {
  _id?: number;
  title: string;
  description: string;
  createdAt?: string;
}

/**
 * Opens or creates the IndexedDB database
 */
export async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "_id", autoIncrement: true });
      }
    },
  });
}

/**
 * Saves or updates an idea in the database
 * @param idea - The idea object to save
 */
export async function saveIdea(idea: Idea): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, idea);
}

/**
 * Fetches all ideas from the database
 * @returns A list of all stored ideas
 */
export async function getAllIdeas(): Promise<Idea[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME) as Promise<Idea[]>;
}

/**
 * Deletes a specific idea by its ID
 * @param id - The idea's unique key (_id)
 */
export async function deleteIdea(id: number): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

/**
 * Clears all ideas from the database
 */
export async function clearIdeas(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE_NAME);
}
