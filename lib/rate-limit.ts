import type { NextRequest } from "next/server"

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store
const store: RateLimitStore = {}

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest, identifier: string) => {
    const now = Date.now()
    const key = `${identifier}:${Math.floor(now / config.windowMs)}`

    // Clean up old entries
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k]
      }
    })

    // Check current count
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + config.windowMs,
      }
    }

    store[key].count++

    const isLimited = store[key].count > config.maxRequests
    const remaining = Math.max(0, config.maxRequests - store[key].count)
    const resetTime = store[key].resetTime

    return {
      isLimited,
      remaining,
      resetTime,
      headers: {
        "X-RateLimit-Limit": config.maxRequests.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
      },
    }
  }
}

// Rate limiters for different endpoints
export const createBuyerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 creates per 15 minutes
})

export const updateBuyerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 updates per 15 minutes
})

export const importLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 imports per hour
})
