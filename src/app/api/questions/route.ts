// @ts-nocheck
/* eslint-disable */

import { GPTService } from '@/app/services/gptService';
import { applyRateLimit } from '../utils/rateLimiter';

const gptService = new GPTService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, level, userContext } = body;

    const rateLimitResult = await applyRateLimit(request);
    if (rateLimitResult !== true) {
      return rateLimitResult;
    }

    const question = await gptService.getPlaygroundQuestion(
      topic,
      level,
      userContext
    );

    return new Response(JSON.stringify(question), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate question' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function GET(request: Request) {
  return new Response(
    JSON.stringify({ error: `Method ${request.method} Not Allowed` }),
    {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
