// Counter to ensure uniqueness even when called multiple times in the same millisecond
let idCounter = 0;

/**
 * Generates a unique ID that combines timestamp, counter, and random string
 * This ensures uniqueness even when called multiple times rapidly
 */
export const generateUniqueId = (): string => {
  idCounter += 1;
  return `${Date.now()}_${idCounter}_${Math.random().toString(36).substr(2, 9)}`;
};
