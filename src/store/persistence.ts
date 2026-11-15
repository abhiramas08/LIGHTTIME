/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Versioned & Validated Browser Storage Persistence
 *
 * Implements safe, versioned persistence of canonical MissionState snapshots.
 * Validates deserialized state using missionStateSchema (Zod) before restoring.
 *
 * CRITICAL ARCHITECTURAL BOUNDARY:
 * Browser storage is strictly a serialized persistence target, NOT the simulation engine itself.
 */

import { MissionState } from '@/simulation/models/missionState';
import { missionStateSchema } from '@/simulation/validation/missionStateSchema';

export const MISSION_STORAGE_KEY = 'lighttime_demo_mission_v1';
export const CURRENT_STORAGE_VERSION = 1;

export interface StoredMissionPayload {
  version: number;
  savedAt: string;
  state: MissionState;
}

/**
 * Checks whether browser localStorage is accessible in current execution context.
 */
function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__lt_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Persists the current canonical MissionState to browser storage with version metadata.
 * Returns true if successfully saved, false if storage was unavailable or failed.
 */
export function saveMissionToStorage(state: MissionState): boolean {
  if (!isStorageAvailable()) return false;

  try {
    const payload: StoredMissionPayload = {
      version: CURRENT_STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      state,
    };
    window.localStorage.setItem(MISSION_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('[LIGHTTIME Persistence] Failed to serialize mission state to localStorage:', error);
    return false;
  }
}

/**
 * Loads and validates a persisted MissionState from browser storage.
 * If data is corrupted, invalid, or obsolete, logs a warning, cleans up, and returns null.
 */
export function loadMissionFromStorage(): MissionState | null {
  if (!isStorageAvailable()) return null;

  try {
    const rawData = window.localStorage.getItem(MISSION_STORAGE_KEY);
    if (!rawData) return null;

    const parsed = JSON.parse(rawData) as unknown;

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      !('state' in parsed)
    ) {
      console.warn('[LIGHTTIME Persistence] Corrupted payload structure found in localStorage. Purging.');
      clearMissionStorage();
      return null;
    }

    const payload = parsed as StoredMissionPayload;

    // Version migration check
    if (payload.version !== CURRENT_STORAGE_VERSION) {
      console.warn(
        `[LIGHTTIME Persistence] Incompatible storage version (found v${payload.version}, expected v${CURRENT_STORAGE_VERSION}). Resetting to default.`
      );
      clearMissionStorage();
      return null;
    }

    // Comprehensive Zod schema validation
    const validationResult = missionStateSchema.safeParse(payload.state);
    if (!validationResult.success) {
      console.warn(
        '[LIGHTTIME Persistence] Saved state failed canonical schema validation. Purging corrupted state:',
        validationResult.error.issues
      );
      clearMissionStorage();
      return null;
    }

    return validationResult.data as MissionState;
  } catch (error) {
    console.warn('[LIGHTTIME Persistence] Error reading or parsing stored state from localStorage:', error);
    clearMissionStorage();
    return null;
  }
}

/**
 * Clears demo mission state from browser storage.
 */
export function clearMissionStorage(): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(MISSION_STORAGE_KEY);
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Returns true if a valid stored mission is present.
 */
export function hasStoredMission(): boolean {
  if (!isStorageAvailable()) return false;
  try {
    return window.localStorage.getItem(MISSION_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
