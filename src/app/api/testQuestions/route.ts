// app/api/testQuestions/route.ts
// @ts-nocheck
/* eslint-disable */
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { applyRateLimit } from '../utils/rateLimiter';

export async function POST(request: Request) {
  try {
    const rateLimitResult = await applyRateLimit(request);
    if (rateLimitResult !== true) {
      return rateLimitResult; // Returns the 429 response with Retry-After header, etc.
    }
    const { topic, examType } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('Missing API key');

    const openai = new OpenAI({ apiKey });
    const systemPrompt = `Create a ${examType} exam test set about ${topic}.
Generate exactly 15 questions following this structure:
{
  "questions": [
    {
      "text": "Clear question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Step-by-step solution",
      "difficulty": 1,
      "topic": "${topic}",
      "subtopic": "specific concept",
      "examType": "${examType}",
      "questionType": "conceptual"
    }
  ]
}`;

    const userPrompt = `Create 15 ${examType} questions about ${topic} (5 easy, 5 medium, 5 hard)`;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      stream: false,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message?.content || '';
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Error in /api/testQuestions:', error);
    return NextResponse.error();
  }
}
