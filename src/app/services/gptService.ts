import { Question, UserContext, ExploreResponse } from '../types';

export class GPTService {
  constructor() {}

  private async makeRequest(
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number = 2000
  ) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `${systemPrompt} Provide your response in JSON format.`,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      });

      return response.choices[0].message?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate content');
    }
  }

  async getExploreContent(
    query: string,
    userContext: UserContext
  ): Promise<ExploreResponse> {
    const response = await fetch('/api/exploreContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, userContext }),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch explore content');
    }
    return await response.json();
  }

  private validateQuestionFormat(question: Question): boolean {
    try {
      if (!question.text?.trim()) return false;
      if (!Array.isArray(question.options) || question.options.length !== 4)
        return false;
      if (question.options.some((opt) => !opt?.trim())) return false;
      if (
        typeof question.correctAnswer !== 'number' ||
        question.correctAnswer < 0 ||
        question.correctAnswer > 3
      )
        return false;
      if (
        !question.explanation?.correct?.trim() ||
        !question.explanation?.key_point?.trim()
      )
        return false;
      if (question.text.length < 10) return false;
      if (question.options.length !== new Set(question.options).size)
        return false;
      if (
        question.explanation.correct.length < 5 ||
        question.explanation.key_point.length < 5
      )
        return false;
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }

  async getPlaygroundQuestion(
    topic: string,
    level: number,
    userContext: UserContext
  ): Promise<Question> {
    const response = await fetch('/api/playgroundQuestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, level, userContext }),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch playground question');
    }
    return await response.json();
  }

  private shuffleOptionsAndAnswer(question: Question): Question {
    const optionsWithIndex = question.options.map((opt, idx) => ({
      text: opt,
      isCorrect: idx === question.correctAnswer,
    }));

    for (let i = optionsWithIndex.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsWithIndex[i], optionsWithIndex[j]] = [
        optionsWithIndex[j],
        optionsWithIndex[i],
      ];
    }

    const newCorrectAnswer = optionsWithIndex.findIndex((opt) => opt.isCorrect);
    return {
      ...question,
      options: optionsWithIndex.map((opt) => opt.text),
      correctAnswer: newCorrectAnswer,
    };
  }

  async getTestQuestions(
    topic: string,
    examType: 'JEE' | 'NEET'
  ): Promise<Question[]> {
    const response = await fetch('/api/testQuestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, examType }),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch test questions');
    }
    return await response.json();
  }

  async exploreQuery(query: string): Promise<string> {
    const response = await fetch('/api/exploreQuery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch explore query');
    }
    const data = await response.json();
    return data.content;
  }

  private buildPrompt(query: string): string {
    return `
      Explain "${query}" using current social media trends, memes, and pop culture references.
      
      Content Style Guide:
      1. Social Media Format Mix:
         - Start with a TikTok-style hook ("POV: you're learning ${query}")
         - Add Instagram carousel-style bullet points
         - Use Twitter/X thread style for facts
         - Include YouTube shorts-style quick explanations
         - End with a viral trend reference
      
      2. Current Trends to Use:
         - Reference viral TikTok sounds/trends
         - Use current meme formats
         - Mention trending shows/movies
         - Reference popular games
         - Include viral challenges
         - Use trending audio references
      
      3. Make it Relatable With:
         - Instagram vs Reality comparisons
         - "That one friend who..." examples
         - "Nobody: / Me:" format
         - "Real ones know..." references
         - "Living rent free in my head" examples
         - "Core memory" references
      
      4. Structure it Like:
         - 🎭 The Hook (TikTok style intro)
         - 📱 The Breakdown (Instagram carousel style)
         - 🧵 The Tea (Twitter thread style facts)
         - 🎬 Quick Takes (YouTube shorts style)
         - 🌟 The Trend Connection (viral reference)
      
      5. Format as:
         {
           "part": {
             "style": "tiktok/insta/twitter/youtube/trend",
             "content": "explanation using current trend",
             "trendReference": "name of trend being referenced",
             "viralComparisons": ["relatable comparison 1", "relatable comparison 2"],
             "popCultureLinks": {
               "trend or term": "how it relates to the topic"
             }
           }
         }

      6. Related Content Style:
         - "Trending topics to explore..."
         - "This gives... vibes"
         - "Main character moments in..."
         - "POV: when you learn about..."

      Important:
      - Use CURRENT trends (2024)
      - Reference viral moments
      - Make pop culture connections
      - Use platform-specific formats
      - Keep updating references
    `;
  }

  async streamExploreContent(
    query: string,
    userContext: UserContext,
    onChunk: (content: {
      text?: string;
      topics?: any[];
      questions?: any[];
    }) => void
  ): Promise<void> {
    const maxRetries = 3;
    let retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        const response = await fetch('/api/streamExplore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, userContext }),
        });
        if (!response.body) {
          throw new Error('No response body');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let mainContent = '';
        let jsonContent = '';
        let currentTopics: any[] = [];
        let currentQuestions: any[] = [];
        let isJsonSection = false;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk.includes('---')) {
            const parts = chunk.split('---');
            mainContent += parts[0];
            if (parts.length > 1) {
              isJsonSection = true;
              jsonContent += parts.slice(1).join('---');
            }
          } else {
            if (isJsonSection) {
              jsonContent += chunk;
            } else {
              mainContent += chunk;
            }
          }
          if (isJsonSection && jsonContent.includes('}')) {
            try {
              const trimmedJson = jsonContent.trim();
              if (trimmedJson.startsWith('{') && trimmedJson.endsWith('}')) {
                const parsed = JSON.parse(trimmedJson);
                if (parsed.topics && Array.isArray(parsed.topics)) {
                  parsed.topics.forEach((topic: any) => {
                    if (
                      !currentTopics.some((t: any) => t.topic === topic.name)
                    ) {
                      currentTopics.push({
                        topic: topic.name,
                        type: topic.type,
                        reason: topic.detail,
                      });
                    }
                  });
                }
                if (parsed.questions && Array.isArray(parsed.questions)) {
                  parsed.questions.forEach((question: any) => {
                    if (
                      !currentQuestions.some(
                        (q: any) => q.question === question.text
                      )
                    ) {
                      currentQuestions.push({
                        question: question.text,
                        type: question.type,
                        context: question.detail,
                      });
                    }
                  });
                }
              }
            } catch (error) {
              console.debug('JSON parse error (waiting for more data):', error);
            }
          }
          onChunk({
            text: mainContent.trim(),
            topics: currentTopics.length > 0 ? currentTopics : undefined,
            questions:
              currentQuestions.length > 0 ? currentQuestions : undefined,
          });
        }
        return;
      } catch (error) {
        retryCount++;
        console.error(`API attempt ${retryCount} failed:`, error);
        if (retryCount === maxRetries) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          throw new Error(
            `Failed to stream content after ${maxRetries} attempts. ${errorMessage}`
          );
        }
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );
      }
    }
  }
}

export const gptService = new GPTService();
