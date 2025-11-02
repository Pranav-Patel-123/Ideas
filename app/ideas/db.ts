/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { openDB } from "idb";

const DB_NAME = "ideas-app";
const STORE_NAME = "ideas";
const DB_VERSION = 1;

/**
 * Open or create the IndexedDB database
 */
export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "_id", autoIncrement: true });
      }
    },
  });
}

/**
 * Save or update an idea
 * @param {Object} idea - The idea object to save
 */
export async function saveIdea(idea) {
  try {
    const db = await getDb();
    await db.put(STORE_NAME, idea);
  } catch (err) {
    console.error("Error saving idea:", err);
  }
}

/**
 * Retrieve all ideas
 * @returns {Promise<Array>} List of ideas
 */
export async function getAllIdeas() {
  try {
    const db = await getDb();
    return await db.getAll(STORE_NAME);
  } catch (err) {
    console.error("Error fetching ideas:", err);
    return [];
  }
}

/**
 * Delete a specific idea by its ID
 * @param {string|number} id - The idea's key (_id)
 */
export async function deleteIdea(id) {
  try {
    const db = await getDb();
    await db.delete(STORE_NAME, id);
  } catch (err) {
    console.error("Error deleting idea:", err);
  }
}

/**
 * Clear all ideas from the database
 */
export async function clearIdeas() {
  try {
    const db = await getDb();
    await db.clear(STORE_NAME);
  } catch (err) {
    console.error("Error clearing ideas:", err);
  }
}
