// app/utils/rateLimiter.ts
// @ts-nocheck
/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Create limiters for different time windows
const minuteLimiter = new RateLimiterMemory({
  points: 155, // 15 requests per minute
  duration: 60, // in seconds
});

const hourLimiter = new RateLimiterMemory({
  points: 250, // 250 requests per hour
  duration: 3600, // in seconds
});

const dayLimiter = new RateLimiterMemory({
  points: 500, // 500 requests per day
  duration: 86400, // in seconds
});

export async function applyRateLimit(
  request: Request
): Promise<true | NextResponse> {
  // Use the Origin header as a temporary identifier.
  const originIdentifier = request.headers.get('origin') || 'unknown';

  try {
    // Consume one point from each limiter concurrently.
    await Promise.all([
      minuteLimiter.consume(originIdentifier),
      hourLimiter.consume(originIdentifier),
      dayLimiter.consume(originIdentifier),
    ]);
    return true;
  } catch (err: any) {
    // Calculate the number of seconds before the next allowed request.
    const retrySecs = Math.ceil((err.msBeforeNext || 1000) / 1000);
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: retrySecs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retrySecs.toString(),
        },
      }
    );
  }
}
