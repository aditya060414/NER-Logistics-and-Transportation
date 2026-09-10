/**
 * IndexedDB Offline Storage Service for Field Officer
 * Provides full offline-first resilience:
 * - Local incident queuing (PENDING_SYNC)
 * - Cached active route (geometry, checkpoints, risk level, alternatives)
 * - Cached task and delivery details
 * - Offline metadata & sync timestamp tracking
 */

import type { IncidentCreateRequest } from '../types/incident';
import type { RoutePlanResponse } from '../types/route';


export interface OfflineReport extends IncidentCreateRequest {
  local_id: string;
  created_at: string;
  sync_status: 'PENDING_SYNC' | 'SYNCED';
  photo_data_url?: string;
}

export interface CachedRouteData {
  id: string;
  delivery_id: string;
  timestamp: string;
  plan: RoutePlanResponse;
}

const DB_NAME = 'ner_logistics_offline_db';
const DB_VERSION = 2;
const STORE_REPORTS = 'pending_reports';
const STORE_ROUTES = 'cached_routes';
const STORE_META = 'offline_meta';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_REPORTS)) {
        db.createObjectStore(STORE_REPORTS, { keyPath: 'local_id' });
      }
      if (!db.objectStoreNames.contains(STORE_ROUTES)) {
        db.createObjectStore(STORE_ROUTES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ------------------- Incident Reports -------------------

export async function saveOfflineReport(report: IncidentCreateRequest, photoDataUrl?: string): Promise<OfflineReport> {
  const db = await openDB();
  const local_id = `OFFLINE-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const record: OfflineReport = {
    ...report,
    local_id,
    created_at: new Date().toISOString(),
    sync_status: 'PENDING_SYNC',
    photo_data_url: photoDataUrl || report.photo_url,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, 'readwrite');
    const store = tx.objectStore(STORE_REPORTS);
    const req = store.add(record);

    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingReports(): Promise<OfflineReport[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REPORTS, 'readonly');
      const store = tx.objectStore(STORE_REPORTS);
      const req = store.getAll();

      req.onsuccess = () => {
        const all: OfflineReport[] = req.result || [];
        resolve(all.filter((r) => r.sync_status === 'PENDING_SYNC'));
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Could not read IndexedDB pending reports:', e);
    return [];
  }
}

export async function getAllSavedReports(): Promise<OfflineReport[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REPORTS, 'readonly');
      const store = tx.objectStore(STORE_REPORTS);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Could not read IndexedDB reports:', e);
    return [];
  }
}

export async function markReportsSynced(localIds: string[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, 'readwrite');
    const store = tx.objectStore(STORE_REPORTS);

    localIds.forEach((id) => {
      // Soft mark or delete
      store.delete(id);
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ------------------- Cached Route -------------------

export async function cacheActiveRoute(deliveryId: string, plan: RoutePlanResponse): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ROUTES, 'readwrite');
      const store = tx.objectStore(STORE_ROUTES);
      const data: CachedRouteData = {
        id: deliveryId,
        delivery_id: deliveryId,
        timestamp: new Date().toISOString(),
        plan,
      };
      const req = store.put(data);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to cache active route in IndexedDB:', e);
  }
}

export async function getCachedRoute(deliveryId: string): Promise<CachedRouteData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ROUTES, 'readonly');
      const store = tx.objectStore(STORE_ROUTES);
      const req = store.get(deliveryId);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to read cached route from IndexedDB:', e);
    return null;
  }
}

// ------------------- Metadata & State -------------------

export async function setOfflineMeta(key: string, value: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_META, 'readwrite');
      const store = tx.objectStore(STORE_META);
      const req = store.put({ key, value, updated_at: new Date().toISOString() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to save offline meta:', e);
  }
}

export async function getOfflineMeta<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_META, 'readonly');
      const store = tx.objectStore(STORE_META);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to read offline meta:', e);
    return null;
  }
}

export async function clearAllOfflineStorage(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_REPORTS, STORE_ROUTES, STORE_META], 'readwrite');
    tx.objectStore(STORE_REPORTS).clear();
    tx.objectStore(STORE_ROUTES).clear();
    tx.objectStore(STORE_META).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
