import { NextApiRequest, NextApiResponse } from 'next';
import { GPTService } from '../explore/services/gptService';
import { Question } from '../../types';

const gptService = new GPTService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { topic, examType } = req.body;

    try {
      const questions = await gptService.getTestQuestions(topic, examType);
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate test questions' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
