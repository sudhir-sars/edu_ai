// app/api/streamExplore/route.ts
// @ts-nocheck
/* eslint-disable */
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { applyRateLimit } from '../utils/rateLimiter';

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request);
    if (rateLimitResult !== true) {
      return rateLimitResult; // Returns the 429 response with Retry-After header, etc.
    }

    // Destructure incoming JSON including conversationContext
    const { query, userContext, conversationContext } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('Missing API key');

    const openai = new OpenAI({ apiKey });

    // Base system prompt with your main instructions
    const baseSystemPrompt = `You are a Gen-Z tutor who explains complex topics concisely for a ${userContext.age} year old.
First provide the explanation in plain text, then provide related content in a STRICT single-line JSON format.

Structure your response exactly like this:

<paragraph 1>

<paragraph 2>

<paragraph 3>

---
{"topics":[{"name":"Topic","type":"prerequisite","detail":"Why"}],"questions":[{"text":"Q?","type":"curiosity","detail":"Context"}]}

RULES:
- ADAPT CONTENT FOR ${userContext.age} YEAR OLD:
  * Match complexity of explanation to age level
- STRICT LENGTH LIMITS:
  * Total explanation must be 60-80 words maximum
  * Each paragraph around 20-25 words each
  * Related questions maximum 12 words each
  * Topic details 1-2 words each
- Keep paragraphs clear and simple
- Third paragraph should directly state applications and facts without phrases like "In real-world applications"
- Use "---" as separator
- JSON must be in a single line
- No line breaks in JSON
- MUST provide EXACTLY 5 related topics and 5 questions
- Related questions must be:
  * Curiosity-driven and thought-provoking
  * STRICTLY 8-12 words maximum
  * Focus on mind-blowing facts or surprising connections
  * Make users think "Wow, I never thought about that!"
- Related topics must be:
  * Directly relevant to understanding the main topic
  * Mix of prerequisites and advanced concepts
  * Brief, clear explanation of importance
- Topic types: prerequisite, extension, application, parallel, deeper
- Question types: curiosity, mechanism, causality, innovation, insight`;

    // Embed the past conversation in the system prompt with clear markers
    const systemPrompt = conversationContext
      ? `${baseSystemPrompt}\n\n--- BEGIN PAST CONVERSATION ---\n${conversationContext}\n--- END PAST CONVERSATION ---`
      : baseSystemPrompt;

    // Define the current user prompt
    const userPrompt = `Explain "${query}" in three very concise paragraphs for a ${userContext.age} year old in Gen-Z style:
1. Basic definition (15-20 words)
2. Key details (15-20 words)
3. Direct applications and facts (15-20 words)

Then provide EXACTLY:
- 5 related topics that help understand ${query} better (age-appropriate)
- 5 mind-blowing questions (8-12 words each) that spark curiosity

Follow the format and length limits strictly.`;

    // Build the messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // Create the streaming chat completion request
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      stream: true,
    });

    // Stream the response back to the client
    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    });

    return new NextResponse(streamResponse, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error in /api/streamExplore:', error);
    return NextResponse.error();
  }
}
