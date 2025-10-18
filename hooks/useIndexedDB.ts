import { useState, useEffect, useCallback } from 'react';
import { initDB, getAllItems, putItem, deleteItem as dbDeleteItem } from '../services/dbService';

type SetValue<T> = (value: T[] | ((prevState: T[]) => T[])) => void;

export const useIndexedDB = <T extends {id: string}>(storeName: string): [T[], SetValue<T>, boolean] => {
  const [value, setValue] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await initDB();
      try {
        const items = await getAllItems<T>(storeName);
        setValue(items);
      } catch (error) {
        console.error(`Failed to load from IndexedDB store ${storeName}`, error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [storeName]);

  const setStoredValue: SetValue<T> = useCallback((newValueOrFn) => {
    setValue(prevValue => {
        const newValue = typeof newValueOrFn === 'function' 
            ? (newValueOrFn as (prevState: T[]) => T[])(prevValue) 
            : newValueOrFn;

        // Sync with IndexedDB asynchronously
        (async () => {
            try {
                const oldIds = new Set(prevValue.map(item => item.id));
                
                // Find items to delete
                for (const item of prevValue) {
                    if (!newValue.some(newItem => newItem.id === item.id)) {
                        await dbDeleteItem(storeName, item.id);
                    }
                }

                // Find items to add or update
                for (const item of newValue) {
                    await putItem(storeName, item);
                }
            } catch (error) {
                console.error(`Failed to sync store ${storeName} with IndexedDB`, error);
                // In a real app, you might want to handle this error, e.g., by reverting the state
            }
        })();

        return newValue;
    });
  }, [storeName]);

  return [value, setStoredValue, isLoading];
};
