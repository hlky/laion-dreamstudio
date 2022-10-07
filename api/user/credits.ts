import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function (req: VercelRequest, res: VercelResponse) {
    try {
        const word_phrase = req.body.word_phrase;
        const user_id_query = await prisma.users.findFirstOrThrow({
            where: { word_seed: word_phrase}
        });
        let credits = user_id_query.credits;
        let selas_token = user_id_query.selas_token || '';
        if (credits == 0) {
          selas_token = '';
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ credits: credits, token: selas_token });
      } catch (error) {
        return res.status(400).json({ result: 'error' });
      }
    
}