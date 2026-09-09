/**
 * IndexedDB Offline Storage Service
 * Provides offline-first caching for field officer incident reporting when network is unavailable.
 */

import type { IncidentCreateRequest } from '../types/incident';

export interface OfflineReport extends IncidentCreateRequest {
  local_id: string;
  created_at: string;
  sync_status: 'PENDING_SYNC' | 'SYNCED';
}

const DB_NAME = 'ner_logistics_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'pending_reports';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'local_id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineReport(report: IncidentCreateRequest): Promise<OfflineReport> {
  const db = await openDB();
  const local_id = `OFFLINE-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const record: OfflineReport = {
    ...report,
    local_id,
    created_at: new Date().toISOString(),
    sync_status: 'PENDING_SYNC',
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(record);

    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingReports(): Promise<OfflineReport[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const all: OfflineReport[] = req.result || [];
        resolve(all.filter((r) => r.sync_status === 'PENDING_SYNC'));
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Could not read IndexedDB:', e);
    return [];
  }
}

export async function markReportsSynced(localIds: string[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    localIds.forEach((id) => {
      store.delete(id);
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllOfflineReports(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
