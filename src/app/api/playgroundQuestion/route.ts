// app/api/playgroundQuestion/route.ts
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
    const { topic, level, userContext } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('Missing API key');

    const openai = new OpenAI({ apiKey });
    const aspects = [
      'core_concepts',
      'applications',
      'problem_solving',
      'analysis',
      'current_trends',
    ];
    const selectedAspect = aspects[Math.floor(Math.random() * aspects.length)];

    const systemPrompt = `Generate a UNIQUE multiple-choice question about ${topic}.
    Focus on: ${selectedAspect.replace('_', ' ')}

    Return in this JSON format:
    {
      "text": "question text here",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": RANDOMLY_PICKED_NUMBER_0_TO_3,
      "explanation": {
        "correct": "Brief explanation of why the correct answer is right (max 15 words)",
        "key_point": "One key concept to remember (max 10 words)"
      },
      "difficulty": ${level},
      "topic": "${topic}",
      "subtopic": "specific subtopic",
      "questionType": "conceptual",
      "ageGroup": "${userContext.age}"
    }

    IMPORTANT RULES FOR UNIQUENESS:
    1. For ${topic}, based on selected aspect:
      - core_concepts: Focus on fundamental principles and theories
      - applications: Focus on real-world use cases and implementations
      - problem_solving: Present a scenario that needs solution
      - analysis: Compare different approaches or technologies
      - current_trends: Focus on recent developments and future directions

    2. Question Variety:
      - NEVER use the same question pattern twice
      - Mix theoretical and practical aspects
      - Include industry-specific examples
      - Use different question formats (what/why/how/compare)
      - Incorporate current developments in ${topic}

    3. Answer Choices:
      - Make ALL options equally plausible
      - Randomly assign the correct answer (0-3)
      - Ensure options are distinct but related
      - Include common misconceptions
      - Make wrong options educational

    4. Format Requirements:
      - Question must be detailed and specific
      - Each option must be substantive
      - Explanation must cover why the correct answer is right AND why others are wrong
      - Include real-world context where possible
      - Use age-appropriate language

    DIFFICULTY ADJUSTMENT GUIDELINES:
      - For difficulty levels 1-3: Use simple language, focus on basic concepts, and design straightforward questions.
      - For difficulty levels 4-7: Introduce intermediate concepts, moderate complexity, and require some analytical reasoning.
      - For difficulty levels 8-10: Craft challenging questions that involve advanced concepts, critical thinking, and deeper analysis.

    ENSURE HIGH ENTROPY:
      - Randomize question patterns
      - Vary difficulty within level ${level}
      - Mix theoretical and practical aspects
      - Use different companies/technologies as examples
      - Include various ${topic} scenarios

    EXPLANATION GUIDELINES:
      - Keep explanations extremely concise and clear
      - Focus on the most important point only
      - Use simple language
      - Highlight the key concept
      - No redundant information
      - Maximum 25 words total`;

    const userPrompt = `Create a completely unique ${level}/10 difficulty question about ${topic}.
    Focus on ${selectedAspect.replace('_', ' ')}.
    Ensure the correct answer is randomly placed.
    Make it engaging for a ${userContext.age} year old student.
    Use current examples and trends.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      stream: false,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message?.content || '';
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Error in /api/playgroundQuestion:', error);
    return NextResponse.error();
  }
}
