
export const STORAGE_KEYS = {
  PATIENT_PROFILE: "patientProfile",
  TRIAL_ANALYSES: "trialAnalyses",
  SAVED_TRIALS: "savedTrials",
};

/**
 * Robust localStorage wrapper with error handling and automatic pruning
 */
export const smartStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`Storage failed for ${key}, attempting recovery...`, e);
      
      if (key === STORAGE_KEYS.TRIAL_ANALYSES) {
        // If analyses fail, prune and retry
        return smartStorage.pruneAndRetry(key, value);
      }
      
      return false;
    }
  },

  /**
   * Specifically handles pruning trial analyses when storage is full
   */
  pruneAndRetry: (key: string, value: any): boolean => {
    try {
      if (typeof value !== 'object' || value === null) return false;
      
      const entries = Object.entries(value);
      if (entries.length < 5) return false; // Too small to prune effectively

      // Keep only the most recent 20 analyses
      const prunedValue = Object.fromEntries(entries.slice(-20));
      localStorage.setItem(key, JSON.stringify(prunedValue));
      console.log("Storage recovered by pruning analyses.");
      return true;
    } catch (e) {
      // If even pruning doesn't help, clear it entirely
      try {
        localStorage.removeItem(key);
        return false;
      } catch (innerE) {
        return false;
      }
    }
  },

  clearAll: () => {
    localStorage.clear();
    window.location.reload();
  },

  getStats: () => {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            size += (localStorage.getItem(key) || "").length;
        }
    }
    return {
      sizeInKb: Math.round(size / 1024),
      count: localStorage.length,
      isNearLimit: size > 4 * 1024 * 1024 // 4MB is near standard 5MB limit
    };
  }
};
