import { openDB } from 'idb';

const DB_NAME = 'ideas-app';
const STORE_NAME = 'ideas';

export async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: '_id' });
      }
    },
  });
}

export async function saveIdea(idea) {
  const db = await getDb();
  await db.put(STORE_NAME, idea);
}

export async function getAllIdeas() {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function deleteIdea(id) {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

export async function clearIdeas() {
  const db = await getDb();
  await db.clear(STORE_NAME);
}
