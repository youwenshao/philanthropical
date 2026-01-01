/**
 * Offline storage utilities using AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_PREFIX = "@philanthropical:";

/**
 * Store data offline
 */
export async function storeOffline(key: string, data: any): Promise<void> {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(`${STORAGE_PREFIX}${key}`, jsonValue);
  } catch (error) {
    console.error("Failed to store offline:", error);
    throw error;
  }
}

/**
 * Retrieve offline data
 */
export async function getOffline<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Failed to get offline data:", error);
    return null;
  }
}

/**
 * Remove offline data
 */
export async function removeOffline(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error("Failed to remove offline data:", error);
    throw error;
  }
}

/**
 * Clear all offline data
 */
export async function clearOffline(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const philanthropicalKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
    await AsyncStorage.multiRemove(philanthropicalKeys);
  } catch (error) {
    console.error("Failed to clear offline data:", error);
    throw error;
  }
}

/**
 * Queue for syncing when online
 */
export async function queueForSync(action: string, data: any): Promise<void> {
  const queue = (await getOffline<any[]>("sync_queue")) || [];
  queue.push({
    action,
    data,
    timestamp: Date.now(),
  });
  await storeOffline("sync_queue", queue);
}

/**
 * Get sync queue
 */
export async function getSyncQueue(): Promise<any[]> {
  return (await getOffline<any[]>("sync_queue")) || [];
}

/**
 * Clear sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  await removeOffline("sync_queue");
}

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  try {
    const response = await fetch("https://www.google.com", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
    });
    return true;
  } catch {
    return false;
  }
}

