// e:/Website/asset-store/src/lib/localStorageManager.ts

const LSTORAGE_PREFIX = "userAppData_"; // A prefix to easily identify your app's data

/**
 * Creates a namespaced key for localStorage to keep user data separate.
 * @param userId - The unique identifier for the user. Can be null/undefined for anonymous users.
 * @param dataKey - The specific key for the piece of data.
 * @returns A namespaced string key.
 */
function getUserStorageKey(userId: string | null | undefined, dataKey: string): string {
    if (!userId) {
        // console.warn("Attempting to use localStorage without a userId. Data will be stored under an 'anonymous' namespace.");
        return `${LSTORAGE_PREFIX}anonymous_${dataKey}`;
    }
    return `${LSTORAGE_PREFIX}${userId}_${dataKey}`;
}

/**
 * Saves data to localStorage for a specific user.
 * @param userId - The unique identifier for the user. Can be null/undefined for anonymous users.
 * @param dataKey - The key under which to store the data (e.g., 'themePreferences', 'lastViewedAsset').
 * @param data - The data to store (will be JSON.stringified).
 */
export function saveDataToLocalStorage<T>(userId: string | null | undefined, dataKey: string, data: T): void {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const key = getUserStorageKey(userId, dataKey);
            localStorage.setItem(key, JSON.stringify(data));
            // console.log(`Data saved to localStorage for user ${userId || 'anonymous'}, key: ${dataKey}`);
        } catch (error) {
            console.error("Error saving to localStorage:", error);
            // Handle potential errors, e.g., storage full (QuotaExceededError)
        }
    } else {
        // console.warn("localStorage is not available.");
    }
}

/**
 * Retrieves data from localStorage for a specific user.
 * @param userId - The unique identifier for the user. Can be null/undefined for anonymous users.
 * @param dataKey - The key of the data to retrieve.
 * @returns The retrieved data (parsed from JSON), or null if not found or an error occurs.
 */
export function getDataFromLocalStorage<T>(userId: string | null | undefined, dataKey: string): T | null {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const key = getUserStorageKey(userId, dataKey);
            const storedData = localStorage.getItem(key);
            if (storedData) {
                return JSON.parse(storedData) as T;
            }
        } catch (error) {
            console.error("Error reading from localStorage:", error);
        }
    } else {
        // console.warn("localStorage is not available.");
    }
    return null;
}

/**
 * Removes a specific piece of data from localStorage for a user.
 * @param userId - The unique identifier for the user. Can be null/undefined for anonymous users.
 * @param dataKey - The key of the data to remove.
 */
export function removeDataFromLocalStorage(userId: string | null | undefined, dataKey: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const key = getUserStorageKey(userId, dataKey);
            localStorage.removeItem(key);
            // console.log(`Data removed from localStorage for user ${userId || 'anonymous'}, key: ${dataKey}`);
        } catch (error) {
            console.error("Error removing from localStorage:", error);
        }
    } else {
        // console.warn("localStorage is not available.");
    }
}

/**
 * Retrieves all data stored in localStorage for a specific user under your app's prefix.
 * This allows the user to "read the memory" of what's stored for them.
 * @param userId - The unique identifier for the user. Can be null/undefined for anonymous users.
 * @returns An object where keys are your original dataKeys and values are the stored data.
 */
export function getAllUserDataFromLocalStorage(userId: string | null | undefined): Record<string, any> {
    const userData: Record<string, any> = {};
    if (typeof window !== 'undefined' && window.localStorage) {
        const userKeyPrefix = getUserStorageKey(userId, ''); // Gets "userAppData_userId_" or "userAppData_anonymous_"

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(userKeyPrefix)) {
                try {
                    const storedData = localStorage.getItem(key);
                    if (storedData) {
                        const originalDataKey = key.substring(userKeyPrefix.length);
                        userData[originalDataKey] = JSON.parse(storedData);
                    }
                } catch (error) {
                    console.error(`Error parsing data for localStorage key ${key}:`, error);
                    // Optionally store the raw string or an error message if parsing fails
                }
            }
        }
    }
    return userData;
}