/**
 * Offline Storage Service using IndexedDB
 * Enables offline functionality with sync when online
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface IEMSSchema extends DBSchema {
  projects: {
    key: string;
    value: {
      id: string;
      data: unknown;
      syncStatus: 'synced' | 'pending' | 'conflict';
      lastModified: number;
    };
  };
  tasks: {
    key: string;
    value: {
      id: string;
      data: unknown;
      syncStatus: 'synced' | 'pending' | 'conflict';
      lastModified: number;
    };
  };
  documents: {
    key: string;
    value: {
      id: string;
      data: unknown;
      syncStatus: 'synced' | 'pending' | 'conflict';
      lastModified: number;
    };
  };
  syncQueue: {
    key: number;
    value: {
      id?: number;
      entityType: string;
      entityId: string;
      operation: 'create' | 'update' | 'delete';
      data: unknown;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

class OfflineStorageService {
  private db: IDBPDatabase<IEMSSchema> | null = null;
  private readonly DB_NAME = 'iems_offline';
  private readonly VERSION = 1;

  async init(): Promise<void> {
    this.db = await openDB<IEMSSchema>(this.DB_NAME, this.VERSION, {
      upgrade(db: IDBPDatabase<IEMSSchema>) {
        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }

        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }

        // Documents store
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
          syncStore.createIndex('by-timestamp', 'timestamp');
        }
      }
    });
  }

  /**
   * Save data offline
   */
  async save<T>(storeName: 'projects' | 'tasks' | 'documents', id: string, data: T): Promise<void> {
    if (!this.db) await this.init();

    await this.db!.put(storeName, {
      id,
      data,
      syncStatus: 'pending',
      lastModified: Date.now()
    });

    // Add to sync queue
    await this.addToSyncQueue(storeName, id, 'update', data);
  }

  /**
   * Get data from offline storage
   */
  async get<T>(storeName: 'projects' | 'tasks' | 'documents', id: string): Promise<T | null> {
    if (!this.db) await this.init();

    const result = await this.db!.get(storeName, id);
    return result ? (result.data as T) : null;
  }

  /**
   * Get all data from store
   */
  async getAll<T>(storeName: 'projects' | 'tasks' | 'documents'): Promise<T[]> {
    if (!this.db) await this.init();

    const results = await this.db!.getAll(storeName);
    return results.map((r: any) => r.data as T);
  }

  /**
   * Delete from offline storage
   */
  async delete(storeName: 'projects' | 'tasks' | 'documents', id: string): Promise<void> {
    if (!this.db) await this.init();

    await this.db!.delete(storeName, id);
    await this.addToSyncQueue(storeName, id, 'delete', null);
  }

  /**
   * Add operation to sync queue
   */
  private async addToSyncQueue(
    entityType: string,
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    data: unknown
  ): Promise<void> {
    if (!this.db) return;

    await this.db.add('syncQueue', {
      entityType,
      entityId,
      operation,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get pending sync operations
   */
  async getPendingSyncOperations(): Promise<
    Array<{
      id: number;
      entityType: string;
      entityId: string;
      operation: 'create' | 'update' | 'delete';
      data: unknown;
      timestamp: number;
    }>
  > {
    if (!this.db) await this.init();

    const tx = this.db!.transaction('syncQueue', 'readonly');
    const index = tx.store.index('by-timestamp');
    return (await index.getAll()) as {
      id: number;
      entityType: string;
      entityId: string;
      operation: 'create' | 'update' | 'delete';
      data: unknown;
      timestamp: number;
    }[];
  }

  /**
   * Sync with server
   */
  async syncWithServer(apiClient: {
    sync: (operations: unknown[]) => Promise<{ success: boolean; synced: number[] }>;
  }): Promise<{ synced: number; failed: number }> {
    const operations = await this.getPendingSyncOperations();

    if (operations.length === 0) {
      return { synced: 0, failed: 0 };
    }

    try {
      const result = await apiClient.sync(operations);

      if (result.success) {
        // Remove synced operations
        for (const id of result.synced) {
          await this.removeSyncOperation(id);
        }

        return { synced: result.synced.length, failed: operations.length - result.synced.length };
      }

      return { synced: 0, failed: operations.length };
    } catch (error) {
      console.error('Sync failed:', error);
      return { synced: 0, failed: operations.length };
    }
  }

  /**
   * Remove sync operation from queue
   */
  private async removeSyncOperation(id: number): Promise<void> {
    if (!this.db) return;
    await this.db.delete('syncQueue', id);
  }

  /**
   * Clear all offline data
   */
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    await this.db!.clear('projects');
    await this.db!.clear('tasks');
    await this.db!.clear('documents');
    await this.db!.clear('syncQueue');
  }

  /**
   * Get storage stats
   */
  async getStats(): Promise<{
    projects: number;
    tasks: number;
    documents: number;
    pendingSync: number;
  }> {
    if (!this.db) await this.init();

    const [projects, tasks, documents, syncQueue] = await Promise.all([
      this.db!.count('projects'),
      this.db!.count('tasks'),
      this.db!.count('documents'),
      this.db!.count('syncQueue')
    ]);

    return {
      projects,
      tasks,
      documents,
      pendingSync: syncQueue
    };
  }
}

export const offlineStorageService = new OfflineStorageService();
