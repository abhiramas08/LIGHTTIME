/**
 * LIGHTTIME – Human-Centred Autonomous Lunar Mission Simulator
 * Resilient Scientific API Client & Cache Engine
 *
 * Implements:
 * - Request validation (date format YYYY-MM-DD, query range constraints).
 * - Multi-tier caching (In-Memory + LocalStorage persistence with TTL).
 * - Rate-limit tracking and 429 mitigation with exponential backoff & jitter.
 * - Non-crashing graceful degradation to offline fallback data.
 * - Provenance tracking for all outgoing payload responses.
 */

import {
  DataProvenance,
  DataOriginNature,
  ScientificSourceId,
  RateLimitStatus,
} from './types';

export class ScientificApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public source?: ScientificSourceId,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ScientificApiError';
  }
}

export class RateLimitExceededError extends ScientificApiError {
  constructor(
    public resetTimeMs: number,
    source: ScientificSourceId = 'NASA_DONKI'
  ) {
    super(`Rate limit exceeded for ${source}. Backing off until ${new Date(resetTimeMs).toISOString()}`, 429, source);
    this.name = 'RateLimitExceededError';
  }
}

export class UnitValidationError extends Error {
  constructor(public field: string, public receivedValue: unknown, public expectedUnit: string) {
    super(`Unit validation failed for "${field}": received ${JSON.stringify(receivedValue)}, expected ${expectedUnit}`);
    this.name = 'UnitValidationError';
  }
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

export interface RequestOptions<T> {
  url: string;
  source: ScientificSourceId;
  version: string;
  sourceUrl: string;
  attributionNotice: string;
  ttlMs?: number; // default: 15 minutes
  maxRetries?: number; // default: 2
  fallbackData?: T;
  validateUnits?: (data: unknown) => boolean;
}

export class ResilientScientificApiClient {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private rateLimits: Map<ScientificSourceId, RateLimitStatus> = new Map();

  constructor() {
    this.initRateLimit('NASA_DONKI', 30);
    this.initRateLimit('NASA_OSDR', 100);
  }

  private initRateLimit(source: ScientificSourceId, limit: number) {
    this.rateLimits.set(source, {
      limit,
      remaining: limit,
      resetTimeMs: 0,
      isThrottled: false,
    });
  }

  public getRateLimitStatus(source: ScientificSourceId): RateLimitStatus {
    const current = this.rateLimits.get(source) || {
      limit: 100,
      remaining: 100,
      resetTimeMs: 0,
      isThrottled: false,
    };

    // If cooldown passed, clear throttle
    if (current.isThrottled && Date.now() >= current.resetTimeMs) {
      current.isThrottled = false;
      current.remaining = current.limit;
    }

    return { ...current };
  }

  /**
   * Validate ISO date strings in YYYY-MM-DD format and range
   */
  public validateDateRange(startDate: string, endDate: string, maxDays = 30): void {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      throw new ScientificApiError(`Invalid startDate format "${startDate}". Expected YYYY-MM-DD.`);
    }
    if (!dateRegex.test(endDate)) {
      throw new ScientificApiError(`Invalid endDate format "${endDate}". Expected YYYY-MM-DD.`);
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (isNaN(start) || isNaN(end)) {
      throw new ScientificApiError('Invalid date values provided in date range.');
    }

    if (start > end) {
      throw new ScientificApiError(`startDate (${startDate}) cannot be after endDate (${endDate}).`);
    }

    const diffDays = (end - start) / (1000 * 60 * 60 * 24);
    if (diffDays > maxDays) {
      throw new ScientificApiError(`Requested range (${diffDays.toFixed(0)} days) exceeds maximum allowed query window of ${maxDays} days.`);
    }
  }

  /**
   * Fetch with multi-tier caching, rate-limit protection, and fallback safety
   */
  public async fetchWithResilience<T>(options: RequestOptions<T>): Promise<{ data: T; provenance: DataProvenance }> {
    const {
      url,
      source,
      version,
      sourceUrl,
      attributionNotice,
      ttlMs = 15 * 60 * 1000, // 15 mins default
      maxRetries = 2,
      fallbackData,
      validateUnits,
    } = options;

    const cacheKey = `lighttime_cache_${url}`;

    // 1. Check in-memory cache
    const memCached = this.memoryCache.get(cacheKey);
    if (memCached && Date.now() - memCached.timestamp < memCached.ttlMs) {
      return {
        data: memCached.data as T,
        provenance: this.createProvenance(source, version, sourceUrl, attributionNotice, 'CACHED_OBSERVATION'),
      };
    }

    // 2. Check localStorage cache
    try {
      const storageItem = localStorage.getItem(cacheKey);
      if (storageItem) {
        const parsed: CacheEntry<T> = JSON.parse(storageItem);
        if (Date.now() - parsed.timestamp < parsed.ttlMs) {
          this.memoryCache.set(cacheKey, parsed);
          return {
            data: parsed.data,
            provenance: this.createProvenance(source, version, sourceUrl, attributionNotice, 'CACHED_OBSERVATION'),
          };
        }
      }
    } catch {
      // Storage unavailable or quota exceeded, proceed cleanly
    }

    // 3. Check rate limit status
    const rateLimit = this.getRateLimitStatus(source);
    if (rateLimit.isThrottled) {
      if (fallbackData !== undefined) {
        return {
          data: fallbackData,
          provenance: this.createProvenance(source, version, sourceUrl, attributionNotice, 'OFFLINE_FALLBACK'),
        };
      }
      throw new RateLimitExceededError(rateLimit.resetTimeMs, source);
    }

    // 4. Execute fetch with retry and backoff
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const response = await fetch(url);

        // Update rate limits from headers if present
        const limitHeader = response.headers.get('X-RateLimit-Limit');
        const remainingHeader = response.headers.get('X-RateLimit-Remaining');
        if (limitHeader && remainingHeader) {
          const lim = parseInt(limitHeader, 10);
          const rem = parseInt(remainingHeader, 10);
          if (!isNaN(lim) && !isNaN(rem)) {
            this.rateLimits.set(source, {
              limit: lim,
              remaining: rem,
              resetTimeMs: Date.now() + 3600000,
              isThrottled: rem <= 0,
            });
          }
        }

        if (response.status === 429) {
          // Throttled by remote server
          const retryAfterSec = parseInt(response.headers.get('Retry-After') || '60', 10);
          const resetTime = Date.now() + (retryAfterSec * 1000);
          this.rateLimits.set(source, {
            ...rateLimit,
            remaining: 0,
            resetTimeMs: resetTime,
            isThrottled: true,
          });

          if (fallbackData !== undefined) {
            return {
              data: fallbackData,
              provenance: this.createProvenance(source, version, sourceUrl, attributionNotice, 'OFFLINE_FALLBACK'),
            };
          }
          throw new RateLimitExceededError(resetTime, source);
        }

        if (!response.ok) {
          throw new ScientificApiError(
            `HTTP ${response.status} ${response.statusText} from ${source}`,
            response.status,
            source
          );
        }

        const rawData = await response.json();

        // Optional unit/schema validation
        if (validateUnits && !validateUnits(rawData)) {
          throw new ScientificApiError(`Unit validation check failed on response payload from ${source}`);
        }

        // Store into cache
        const cacheEntry: CacheEntry<T> = {
          data: rawData as T,
          timestamp: Date.now(),
          ttlMs,
        };
        this.memoryCache.set(cacheKey, cacheEntry);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
        } catch {
          // Ignore localStorage quota failures
        }

        return {
          data: rawData as T,
          provenance: this.createProvenance(source, version, sourceUrl, attributionNotice, 'LIVE_OBSERVATION'),
        };
      } catch (err) {
        attempt++;
        if (attempt > maxRetries || (err instanceof ScientificApiError && err.statusCode && err.statusCode < 500 && err.statusCode !== 429)) {
          // On final failure or non-retryable 4xx client errors, return fallback if available
          if (fallbackData !== undefined) {
            return {
              data: fallbackData,
              provenance: this.createProvenance(source, version, sourceUrl, attributionNotice, 'OFFLINE_FALLBACK'),
            };
          }
          throw err;
        }

        // Exponential backoff with jitter
        const backoffMs = Math.min(2000, 300 * Math.pow(2, attempt) + Math.random() * 200);
        await new Promise((res) => setTimeout(res, backoffMs));
      }
    }

    if (fallbackData !== undefined) {
      return {
        data: fallbackData,
        provenance: this.createProvenance(source, version, sourceUrl, attributionNotice, 'OFFLINE_FALLBACK'),
      };
    }

    throw new ScientificApiError(`Failed to fetch from ${source} after ${maxRetries} retries`);
  }

  public createProvenance(
    source: ScientificSourceId,
    version: string,
    sourceUrl: string,
    attributionNotice: string,
    originNature: DataOriginNature
  ): DataProvenance {
    return {
      source,
      retrievalTimestamp: new Date().toISOString(),
      version,
      originNature,
      sourceUrl,
      attributionNotice,
    };
  }

  public clearCache(): void {
    this.memoryCache.clear();
  }

  public resetRateLimits(): void {
    this.initRateLimit('NASA_DONKI', 30);
    this.initRateLimit('NASA_OSDR', 100);
  }
}

export const resilientApiClient = new ResilientScientificApiClient();
