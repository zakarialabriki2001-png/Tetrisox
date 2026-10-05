import { OracleDatabase } from '../types';

const DB_NAME = 'OracleMatchAI_Storage';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const STATE_KEY = 'current_database';

export class IndexedDbStorage {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        this.dbPromise = null;
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Loads the complete persistent database from IndexedDB
   */
  static async loadDatabase(): Promise<OracleDatabase | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(STATE_KEY);

        request.onsuccess = () => {
          if (request.result && request.result.matches) {
            resolve(request.result as OracleDatabase);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          resolve(null);
        };
      });
    } catch (e) {
      console.warn('[IndexedDB] Load failed or unavailable:', e);
      return null;
    }
  }

  static async load(): Promise<OracleDatabase | null> {
    return this.loadDatabase();
  }

  /**
   * Saves the entire OracleDatabase (including 10,000+ matches) safely into IndexedDB
   */
  static async saveDatabase(data: OracleDatabase): Promise<boolean> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data, STATE_KEY);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          console.warn('[IndexedDB] Save error:', request.error);
          resolve(false);
        };
      });
    } catch (e) {
      console.warn('[IndexedDB] Save failed or unavailable:', e);
      return false;
    }
  }

  static async save(data: OracleDatabase): Promise<boolean> {
    return this.saveDatabase(data);
  }

  /**
   * Clears the IndexedDB store
   */
  static async clear(): Promise<boolean> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(STATE_KEY);

        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }
}
