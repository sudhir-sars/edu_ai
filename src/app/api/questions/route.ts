import { NextApiRequest, NextApiResponse } from 'next';
import { GPTService } from '@/app/services/gptService';
import { UserContext, Question } from '../../types';

const gptService = new GPTService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { topic, level, userContext } = req.body;

    try {
      const question = await gptService.getPlaygroundQuestion(
        topic,
        level,
        userContext
      );
      res.status(200).json(question);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate question' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
