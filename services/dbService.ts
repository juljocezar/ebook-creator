const DB_NAME = 'AiEbookOrchestratorDB';
const DB_VERSION = 1;
const STORES = ['documents', 'templates'];

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Database error: ' + request.error);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES[0])) {
        db.createObjectStore(STORES[0], { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES[1])) {
        db.createObjectStore(STORES[1], { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(true);
    };
  });
};

export const getAllItems = <T>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
        return reject("DB not initialized");
    }
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error(`Error getting all items from ${storeName}:`, request.error);
      reject(request.error);
    };
  });
};

export const putItem = <T>(storeName: string, item: T): Promise<T> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject("DB not initialized");
        }
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => {
            resolve(item);
        };

        request.onerror = () => {
            console.error(`Error putting item in ${storeName}:`, request.error);
            reject(request.error);
        };
    });
};


export const deleteItem = (storeName: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject("DB not initialized");
        }
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            console.error(`Error deleting item from ${storeName}:`, request.error);
            reject(request.error);
        };
    });
};
