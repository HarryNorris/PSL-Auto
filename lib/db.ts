import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { VaultDocument, Document } from '../types';

const DB_NAME = 'psl-auto-db';
const DB_VERSION = 3; // Keep version consistent

interface PslDB extends DBSchema {
  vault: {
    key: string;
    value: VaultDocument;
    indexes: { 'category': string };
  };
  activity: {
    key: string;
    value: Document;
    indexes: { 'date': string };
  };
}

// --- Singleton DB Access ---
let dbPromise: Promise<IDBPDatabase<PslDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    console.log(`DB: Opening database ${DB_NAME} v${DB_VERSION}...`);
    dbPromise = openDB<PslDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`DB: Upgrading from v${oldVersion} to v${newVersion}`);
        
        if (!db.objectStoreNames.contains('vault')) {
          console.log('DB: Creating "vault" object store');
          const vaultStore = db.createObjectStore('vault', { keyPath: 'id' });
          vaultStore.createIndex('category', 'category');
        }
        
        if (!db.objectStoreNames.contains('activity')) {
          console.log('DB: Creating "activity" object store');
          const activityStore = db.createObjectStore('activity', { keyPath: 'id' });
          activityStore.createIndex('date', 'date');
        }
      },
      blocked() {
        console.warn('DB: Database open blocked. Close other tabs.');
      },
      blocking() {
        console.warn('DB: Database blocking new version. Reloading...');
      },
      terminated() {
        console.error('DB: Database connection terminated unexpectedly.');
      },
    });
  }
  return dbPromise;
};

// --- Vault Operations ---

export const addVaultDocument = async (doc: VaultDocument) => {
  console.log(`DB: Attempting to add vault document: ${doc.name} (${doc.id})`);
  try {
    const db = await getDB();
    await db.put('vault', doc);
    console.log(`DB: Add success for ${doc.id}`);
  } catch (err) {
    console.error(`DB Error adding document ${doc.id}:`, err);
    throw err;
  }
};

export const getVaultDocuments = async (): Promise<VaultDocument[]> => {
  console.log('DB: Fetching all vault documents...');
  try {
    const db = await getDB();
    const docs = await db.getAll('vault');
    console.log(`DB: Retrieved ${docs.length} documents`);
    return docs;
  } catch (err) {
    console.error('DB Error fetching documents:', err);
    throw err;
  }
};

export const deleteVaultDocument = async (id: string) => {
  console.log(`DB: Deleting ID: ${id}`);
  try {
    const db = await getDB();
    const tx = db.transaction('vault', 'readwrite');
    const store = tx.objectStore('vault');
    await store.delete(id);
    await tx.done;
    console.log('DB: Delete complete');
  } catch (err) {
    console.error(`DB Error deleting document ${id}:`, err);
    throw err;
  }
};

export const clearVaultDocs = async () => {
  console.log('DB: Attempting to clear all vault documents...');
  try {
    const db = await getDB();
    await db.clear('vault');
    console.log('DB: Clear success');
  } catch (err) {
    console.error('DB Error clearing vault:', err);
    throw err;
  }
};

// --- Activity Operations ---

export const addActivity = async (doc: Document) => {
  console.log(`DB: logging activity: ${doc.name}`);
  try {
    const db = await getDB();
    await db.put('activity', doc);
    console.log('DB: Activity logged');
  } catch (err) {
    console.error('DB Error adding activity:', err);
    throw err;
  }
};

export const getRecentActivity = async (): Promise<Document[]> => {
  console.log('DB: Fetching recent activity...');
  try {
    const db = await getDB();
    const items = await db.getAll('activity');
    console.log(`DB: Retrieved ${items.length} activity items`);
    return items.reverse();
  } catch (err) {
    console.error('DB Error fetching activity:', err);
    throw err;
  }
};

export const deleteActivity = async (id: string) => {
  console.log(`DB: Deleting Activity ID: ${id}`);
  try {
    const db = await getDB();
    const tx = db.transaction('activity', 'readwrite');
    const store = tx.objectStore('activity');
    await store.delete(id);
    await tx.done;
    console.log('DB: Activity delete complete');
  } catch (err) {
    console.error(`DB Error deleting activity ${id}:`, err);
    throw err;
  }
};

export const clearAllActivity = async () => {
  console.log('DB: Attempting to clear all activity...');
  try {
    const db = await getDB();
    await db.clear('activity');
    console.log('DB: Activity Clear success');
  } catch (err) {
    console.error('DB Error clearing activity:', err);
    throw err;
  }
};

// --- Seed (DISABLED) ---
export const seedDatabase = async () => {
  console.log('DB: Seeding is DISABLED to prevent zombie data.');
};