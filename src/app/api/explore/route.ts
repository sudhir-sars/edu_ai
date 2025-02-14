import { NextApiRequest, NextApiResponse } from 'next';
import { GPTService } from './services/gptService';
import { UserContext, ExploreResponse } from '../types';

const gptService = new GPTService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { query, userContext } = req.body;

    try {
      const response = await gptService.getExploreContent(query, userContext);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to explore topic' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
