import { openDB, type IDBPDatabase } from 'idb'
import type { DPREntry, SyncQueueItem, AIProcessingResult } from '@/types'

const DB_NAME = 'oil-pmo-db'
const DB_VERSION = 1

export interface OILDatabase {
  dprEntries: DPREntry
  syncQueue: SyncQueueItem
  aiResults: AIProcessingResult
}

let db: IDBPDatabase<OILDatabase> | null = null

export async function getDB(): Promise<IDBPDatabase<OILDatabase>> {
  if (db) return db
  db = await openDB<OILDatabase>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // DPR Entries store
      if (!database.objectStoreNames.contains('dprEntries')) {
        const dprStore = database.createObjectStore('dprEntries', { keyPath: 'id' })
        dprStore.createIndex('by-project', 'projectId')
        dprStore.createIndex('by-sync-status', 'syncStatus')
        dprStore.createIndex('by-date', 'date')
      }
      // Sync queue
      if (!database.objectStoreNames.contains('syncQueue')) {
        const syncStore = database.createObjectStore('syncQueue', { keyPath: 'id' })
        syncStore.createIndex('by-type', 'type')
      }
      // AI Results
      if (!database.objectStoreNames.contains('aiResults')) {
        const aiStore = database.createObjectStore('aiResults', { keyPath: 'id' })
        aiStore.createIndex('by-dpr', 'dprEntryId')
        aiStore.createIndex('by-status', 'status')
      }
    },
  })
  return db
}

// DPR Operations
export async function saveDPREntry(entry: DPREntry): Promise<void> {
  const database = await getDB()
  await database.put('dprEntries', entry)
}

export async function getDPREntries(projectId?: string): Promise<DPREntry[]> {
  const database = await getDB()
  if (projectId) {
    return database.getAllFromIndex('dprEntries', 'by-project', projectId)
  }
  return database.getAll('dprEntries')
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const database = await getDB()
  return database.getAll('syncQueue')
}

export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  const database = await getDB()
  await database.put('syncQueue', item)
}

export async function removeSyncItem(id: string): Promise<void> {
  const database = await getDB()
  await database.delete('syncQueue', id)
}

export async function saveAIResult(result: AIProcessingResult): Promise<void> {
  const database = await getDB()
  await database.put('aiResults', result)
}

export async function getAIResults(): Promise<AIProcessingResult[]> {
  const database = await getDB()
  return database.getAll('aiResults')
}
