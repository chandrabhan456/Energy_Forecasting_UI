import { openDB } from 'idb';

const DB_NAME = 'csvHistoryDB';
const STORE_NAME = 'history';

export async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

export async function getHistory() {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function addHistoryItem(item) {
  const db = await getDb();
  return db.add(STORE_NAME, item);
}

export async function clearHistory() {
  const db = await getDb();
  return db.clear(STORE_NAME);
}

export async function getSessionById(id) {
  const db = await getDb();
  return db.get(STORE_NAME, id);
}

export async function updateSessionInDb(session) {
  const db = await getDb();
  return db.put(STORE_NAME, session); // Overwrites session with same id
}

// NEW: Update just the sessionName
export async function updateSessionNameInDb(id, newName) {
  const db = await getDb();
  const session = await db.get(STORE_NAME, id);
  if (session) {
    session.sessionName = newName;
    await db.put(STORE_NAME, session);
    return true;
  }
  return false;
}
