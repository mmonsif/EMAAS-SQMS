/**
 * Offline Safety Report Storage & Sync Utility
 * Uses IndexedDB with LocalStorage fallback and Service Worker Background Sync
 */

export interface QueuedOfflineReport {
  id: string; // OFFLINE-Q-XXXX
  timestamp: string;
  data: {
    reportSource: 'frontline_agent' | 'airline_report';
    reporterType: 'anonymous' | 'identified';
    reporterName?: string;
    reporterBadge?: string;
    department: string;
    category: any;
    location: string;
    standNumber?: string;
    flightNumber?: string;
    aircraftReg?: string;
    gseIdLinked?: string;
    description: string;
    photoUrl?: string;
    preMitigationRisk?: any;
  };
  queuedAt: string;
  station: string;
  syncAttempts: number;
}

const DB_NAME = 'RMF_SQMS_OfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_safety_reports';
const FALLBACK_KEY = 'rmf_offline_reports_queue_v1';

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a safety report to offline storage
 */
export async function saveOfflineReport(
  reportData: QueuedOfflineReport['data']
): Promise<QueuedOfflineReport> {
  const offlineReport: QueuedOfflineReport = {
    id: `OFFLINE-Q-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    data: reportData,
    queuedAt: new Date().toISOString(),
    station: 'Marsa Alam International Airport (RMF)',
    syncAttempts: 0
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(offlineReport);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // LocalStorage fallback
    const current = getOfflineReportsFromLocalStorage();
    current.push(offlineReport);
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(current));
  }

  // Request Service Worker Background Sync if available
  registerBackgroundSync();

  return offlineReport;
}

/**
 * Retrieve all currently queued offline reports
 */
export async function getOfflineReports(): Promise<QueuedOfflineReport[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return getOfflineReportsFromLocalStorage();
  }
}

/**
 * Remove a single report by ID after successful sync
 */
export async function removeOfflineReport(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // LocalStorage fallback
    const current = getOfflineReportsFromLocalStorage().filter(r => r.id !== id);
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(current));
  }
}

/**
 * Clear all offline reports
 */
export async function clearAllOfflineReports(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    localStorage.removeItem(FALLBACK_KEY);
  }
}

/**
 * Sync queued reports to Central SQMS
 */
export async function syncOfflineReports(
  submitFn: (data: QueuedOfflineReport['data']) => { id: string; timestamp: string }
): Promise<{ syncedCount: number; syncedIds: string[] }> {
  const queued = await getOfflineReports();
  if (queued.length === 0) {
    return { syncedCount: 0, syncedIds: [] };
  }

  const syncedIds: string[] = [];

  for (const item of queued) {
    try {
      submitFn(item.data);
      await removeOfflineReport(item.id);
      syncedIds.push(item.id);
    } catch (e) {
      console.error('[OfflineSync] Failed to sync report item:', item.id, e);
    }
  }

  return {
    syncedCount: syncedIds.length,
    syncedIds
  };
}

/**
 * Request Service Worker Background Sync registration
 */
export async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync?.register('sync-safety-reports');
    } catch (err) {
      // SyncManager not supported or denied
    }
  }
}

// Fallback helper
function getOfflineReportsFromLocalStorage(): QueuedOfflineReport[] {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
