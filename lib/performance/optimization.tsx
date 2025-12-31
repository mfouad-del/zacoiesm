/**
 * Performance Optimization Utilities
 * Lazy Loading, Virtual Scrolling, Caching
 */

import React, { lazy, Suspense, ComponentType } from 'react';

// ============================================
// Lazy Loading Utilities
// ============================================

/**
 * Lazy load component with custom loading fallback
 */
export function lazyLoadComponent<T extends ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <div>Loading...</div>
) {
  const LazyComponent = lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...(props as any)} />
    </Suspense>
  );
}

/**
 * Preload component
 */
export function preloadComponent(importFunc: () => Promise<unknown>): void {
  importFunc();
}

// ============================================
// Caching Strategy
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, expiresInMs = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMs
    });
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if cache has valid entry
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.expiresIn) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheManager = new CacheManager();

// Cleanup every 5 minutes
setInterval(() => cacheManager.cleanup(), 300000);

// ============================================
// Debounce & Throttle
// ============================================

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================
// Image Lazy Loading
// ============================================

export const lazyLoadImage = (src: string, placeholder?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = () => {
      if (placeholder) {
        resolve(placeholder);
      } else {
        reject(new Error('Failed to load image'));
      }
    };
  });
};

// ============================================
// Request Batching
// ============================================

class RequestBatcher {
  private queue: Array<{
    key: string;
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private readonly waitTime = 50; // ms

  /**
   * Add request to batch
   */
  async add<T>(key: string, fetcher: (keys: string[]) => Promise<T[]>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve: resolve as (value: unknown) => void, reject });

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        this.flush(fetcher);
      }, this.waitTime);
    });
  }

  /**
   * Flush batch
   */
  private async flush<T>(fetcher: (keys: string[]) => Promise<T[]>): Promise<void> {
    const batch = [...this.queue];
    this.queue = [];
    this.timeout = null;

    const keys = batch.map((item) => item.key);

    try {
      const results = await fetcher(keys);

      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach((item) => {
        item.reject(error);
      });
    }
  }
}

export const requestBatcher = new RequestBatcher();

// ============================================
// Memory Management
// ============================================

export class MemoryManager {
  /**
   * Check if memory usage is high
   */
  isMemoryHigh(): boolean {
    if ('memory' in performance && performance.memory) {
      const mem = performance.memory as {
        usedJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
      return mem.usedJSHeapSize / mem.jsHeapSizeLimit > 0.9;
    }
    return false;
  }

  /**
   * Force garbage collection if available
   */
  requestGC(): void {
    if (this.isMemoryHigh()) {
      // Clear caches
      cacheManager.clear();

      // In production, browser will handle GC automatically
      console.info('Memory cleanup requested');
    }
  }
}

export const memoryManager = new MemoryManager();

// ============================================
// Code Splitting Helper
// ============================================

export const splitChunk = (
  chunkName: string,
  importFunc: () => Promise<unknown>
): Promise<unknown> => {
  return importFunc();
};
