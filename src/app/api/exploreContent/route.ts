// app/api/exploreContent/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { query, userContext } = await request.json();
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY; // Use your secret key here (not prefixed with NEXT_PUBLIC_)
    if (!apiKey) throw new Error('Missing API key');

    const openai = new OpenAI({ apiKey });
    const systemPrompt = `You are a Gen-Z tutor who explains complex topics concisely considering you are teaching someone with a low IQ.
    First, identify the domain of the topic from these categories:
    - SCIENCE: Physics, Chemistry, Biology
    - MATHEMATICS: Algebra, Calculus, Geometry
    - TECHNOLOGY: Computer Science, AI, Robotics
    - MEDICAL: Anatomy, Healthcare, Medicine
    - HISTORY: World History, Civilizations
    - BUSINESS: Economics, Finance, Marketing
    - LAW: Legal Systems, Rights
    - PSYCHOLOGY: Human Behavior, Development
    - CURRENT_AFFAIRS: Global Events, Politics
    - GENERAL: Any other topic

    Return your response in this EXACT JSON format:
    {
      "domain": "identified domain",
      "content": {
        "paragraph1": "Core concept in around 20-30 words - clear, simple, story-telling based introduction and definition",
        "paragraph2": "talk more detail about it in around 20-30 words - main ideas and examples",
        "paragraph3": "Real world applications in around 20-40 words - practical uses and relevance"
      },
      "relatedTopics": [
        {
          "topic": "Most fundamental prerequisite concept",
          "type": "prerequisite",
          "reason": "Brief explanation of why this is essential to understand first"
        },
        {
          "topic": "Most exciting advanced application",
          "type": "extension",
          "reason": "Why this advanced topic is fascinating"
        },
        {
          "topic": "Most impactful real-world use",
          "type": "application",
          "reason": "How this changes everyday life"
        },
        {
          "topic": "Most interesting related concept",
          "type": "parallel",
          "reason": "What makes this connection intriguing"
        },
        {
          "topic": "Most thought-provoking aspect",
          "type": "deeper",
          "reason": "Why this specific aspect is mind-bending"
        }
      ],
      "relatedQuestions": [
        {
          "question": "What if...? (speculative question)",
          "type": "curiosity",
          "context": "Thought-provoking scenario"
        },
        {
          "question": "How exactly...? (mechanism question)",
          "type": "mechanism",
          "context": "Fascinating process to understand"
        },
        {
          "question": "Why does...? (causality question)",
          "type": "causality",
          "context": "Surprising cause-effect relationship"
        },
        {
          "question": "Can we...? (possibility question)",
          "type": "innovation",
          "context": "Exciting potential development"
        },
        {
          "question": "What's the connection between...? (insight question)",
          "type": "insight",
          "context": "Unexpected relationship"
        }
      ]
    }

    IMPORTANT RULES:
    - Each paragraph MUST be around 20-30 words
    - Use simple, clear language
    - Focus on key information only
    - No repetition between paragraphs
    - Make every word count
    - Keep examples specific and brief

    SUBTOPIC GUIDELINES:
    - Focus on the most fascinating aspects
    - Highlight unexpected connections
    - Show real-world relevance
    - Include cutting-edge developments
    - Connect to current trends
    - Emphasize "wow factor"

    QUESTION GUIDELINES:
    - Start with curiosity triggers: "What if", "How exactly", "Why does", "Can we"
    - Focus on mind-bending aspects
    - Highlight counterintuitive elements
    - Explore edge cases
    - Connect to emerging trends
    - Challenge assumptions
    - Spark imagination
    - Make reader think "I never thought about that!"`;

    const userPrompt = `Explain "${query}" in approximately three 20-30 word paragraphs:
    1. Basic definition without using words like imagine
    2. more details
    3. Real-world application examples without using the word real world application
    Make it engaging for someone aged ${userContext.age}.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `${systemPrompt} Provide your response in JSON format.`,
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: false,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message?.content || '';
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Error in /api/exploreContent:', error);
    return NextResponse.error();
  }
}
