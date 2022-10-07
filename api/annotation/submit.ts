import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { createSelasClient } from 'selas';
const requestIp = require('request-ip');
const prisma = new PrismaClient();
const crypto = require('crypto');
const rate_limit_seconds = 10;

export default async function (req: VercelRequest, res: VercelResponse) {
    try {
        //selas client
        

        const annotation = req.body.annotation;
        const image_id = req.body.image_id;
        const word_phrase = req.body.word_phrase;
        const user_id_query = await prisma.users.findFirstOrThrow({
            where: { word_seed: word_phrase}
        });
        const user_id = user_id_query.id;
        const current_time = new Date();
        const rate_limit_time = new Date(current_time.setSeconds(current_time.getSeconds() - rate_limit_seconds));
        const rate_limit = await prisma.artifact_annotations.count({
            where: { user_id: user_id, created: { gte: rate_limit_time } }, 
        })
        if (rate_limit > 0) { return res.status(429).json({ result: 'rate limit' }); }
        // check if client has existing token
        
        await prisma.artifact_annotations.create({
            data: {
                md5ip: crypto.createHash('md5').update(requestIp.getClientIp(req)).digest('hex'),
                image_id: image_id,
                annotation: annotation,
                user_id: user_id
            }
        });
        await prisma.users.update({
            where: { id: user_id },
            data: { credits: { increment: 1 } }
        });
        // get client credits
        const user_id_query2 = await prisma.users.findFirstOrThrow({
            where: { word_seed: word_phrase}
        });
        const credits = user_id_query2.credits;
        const selas_token = user_id_query.selas_token || '';
        const selas_token_expiration = user_id_query.selas_token_expiration || current_time;
        if (selas_token == '' || selas_token_expiration < current_time) {
            const client = createSelasClient();
            await client.signIn('hlky@shadow.surf', 'HrOc3YMykBUP7D4WYQH');
	        await client.createCustomer(word_phrase);
	        const { data: token } = await client.createToken(word_phrase, credits, 120);
            const selas_token_expiration = new Date(current_time.setSeconds(current_time.getSeconds() + 120));
            await prisma.users.update({
                where: { id: user_id },
                data: { selas_token: token!.key, selas_token_expiration: selas_token_expiration }
            });
        } else {
            const client = createSelasClient();
            await client.signIn('hlky@shadow.surf', 'HrOc3YMykBUP7D4WYQH');
            await client.addCredits(word_phrase, 1);
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ result: 'success'});
      } catch (error) {
        return res.status(400).json({ result: 'error' });
      }
    
}