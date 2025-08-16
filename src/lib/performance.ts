/**
 * Performance optimization utilities for the PowerPoint Editor
 */

// Debounce function to limit how often a function can be called
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timeout = setTimeout(() => (func as any)(...args), wait);
  };
}

// Throttle function to limit function execution rate
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Batch updates to prevent excessive re-renders
export class BatchUpdater {
  private updates: Array<() => void> = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchSize: number;
  private delay: number;

  constructor(batchSize: number = 10, delay: number = 16) {
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(update: () => void) {
    this.updates.push(update);
    
    if (this.updates.length >= this.batchSize) {
      this.flush();
    } else if (!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), this.delay);
    }
  }

  flush() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    if (this.updates.length > 0) {
      const updates = [...this.updates];
      this.updates = [];
      updates.forEach(update => update());
    }
  }

  clear() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.updates = [];
  }
}

// Canvas rendering optimization
export function canvasOptimizations<T>(items: T[], process: (item: T) => void): void {
  const batchSize = 50;
  let index = 0;

  function processBatch() {
    const slice = items.slice(index, index + batchSize);
    slice.forEach(process);
    index += batchSize;
    if (index < items.length) {
      requestIdleCallback(processBatch);
    }
  }

  processBatch();
}
