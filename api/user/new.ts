import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
const requestIp = require('request-ip');
const prisma = new PrismaClient();
const crypto = require('crypto');
const wordlist = ['will', 'jacket', 'say', 'grid', 'enforce', 'switch', 'bean', 'increase', 'sample', 'near', 'spawn', 'chunk', 'mean', 'angle', 'wage', 'harsh', 'return', 'learn', 'physical', 'setup', 'produce', 'trip', 'observe', 'bring', 'noodle', 'seven', 'long', 'tower', 'twist', 'quote', 'round', 'nurse', 'wall', 'nominee', 'retire', 'ahead', 'saddle', 'lawn', 'session', 'shaft', 'now', 'void', 'outside', 'track', 'apart', 'mimic', 'muscle', 'auto', 'common', 'success', 'web', 'push', 'visual', 'wheel', 'payment', 'find', 'evolve', 'seed', 'solution', 'what', 'aunt', 'fancy', 'paper', 'lawn', 'you', 'maid', 'surprise', 'heart', 'claim', 'spider', 'assist', 'piece', 'ordinary', 'harsh', 'link', 'purchase', 'upper', 'bless', 'light', 'lend', 'sustain', 'danger', 'wash', 'monkey', 'april', 'glad', 'nation', 'find', 'misery', 'kidney', 'adult', 'throw', 'lyrics', 'cargo', 'album', 'truly', 'bounce', 'local', 'lake', 'plunge', 'gravity', 'word', 'exclude', 'middle', 'army', 'wave', 'circle', 'movie', 'dignity', 'rough', 'profit', 'civil', 'fiscal', 'pledge', 'below', 'cloth', 'decorate', 'canoe', 'indicate', 'light', 'theory', 'luggage', 'verify', 'office', 'flat', 'critic', 'move', 'wedding', 'you', 'indicate', 'forest', 'rain', 'diary', 'chimney', 'chase', 'girl', 'force', 'rough', 'sign', 'clarify', 'reason', 'sauce', 'soft', 'danger', 'object', 'vast', 'sample', 'wage', 'cigar', 'blood', 'suffer', 'move', 'stadium', 'aerobic', 'buyer', 'vehicle', 'city', 'once', 'repeat', 'purpose', 'coin', 'olive', 'penalty', 'essay', 'black', 'large', 'anchor', 'negative', 'citizen', 'rally', 'window', 'long', 'eternal', 'genuine', 'infant', 'electric', 'convince', 'leopard', 'alter', 'uphold', 'tortoise', 'genre', 'bench', 'dust', 'crouch', 'siren', 'flat', 'hazard', 'fix', 'pink', 'toilet', 'volume', 'jungle', 'marriage', 'extra', 'digital', 'cement', 'display', 'beef', 'oxygen', 'cram', 'puzzle', 'wave', 'gentle', 'expand', 'avocado', 'portion', 'major', 'cram', 'fantasy', 'virus', 'genre', 'entire', 'lecture', 'dolphin', 'render', 'general', 'garbage', 'around', 'excite', 'universe', 'subject', 'grunt', 'penalty', 'asthma', 'proud', 'guess', 'praise', 'rib', 'news', 'dentist', 'depth', 'finish', 'start', 'stairs', 'bird', 'broken', 'audit', 'enrich', 'device', 'helmet', 'web', 'short', 'galaxy', 'beauty', 'dance', 'buyer', 'lunch', 'small', 'save', 'drum', 'vapor', 'essay', 'move', 'begin', 'nurse', 'hawk', 'normal', 'exact', 'winter', 'change', 'record', 'pluck', 'sugar', 'rice', 'olive', 'dutch', 'voyage', 'rocket', 'thumb', 'exclude', 'upper', 'real', 'liar', 'report', 'topple', 'lumber', 'happy', 'favorite', 'face', 'crystal', 'curious', 'stay', 'forward', 'stomach', 'vendor', 'warm', 'goddess', 'autumn', 'planet', 'differ', 'connect', 'report', 'habit', 'hold', 'skirt', 'cost', 'ribbon', 'shoe', 'thing', 'field', 'game', 'erase', 'hamster', 'clock', 'accuse', 'stool', 'check', 'slim', 'wise', 'eight', 'summer', 'reason', 'empty', 'alone', 'buffalo', 'victory', 'ball', 'mimic', 'hockey', 'destroy', 'estate', 'brother', 'month', 'blossom', 'alert', 'coffee', 'balcony', 'box', 'twelve', 'maid', 'drill', 'path', 'fatal', 'trumpet', 'caught', 'chair', 'forget', 'jelly', 'thought', 'blast', 'trigger', 'sail', 'jelly', 'picnic', 'find', 'holiday', 'frame', 'fatal', 'mercy', 'food', 'merge', 'arm', 'angle', 'congress', 'teach', 'rabbit', 'ladder', 'found', 'wedding', 'change', 'emerge', 'arctic', 'twist', 'fever', 'bundle', 'flat', 'access', 'garden', 'cherry', 'mistake', 'abstract', 'erupt', 'confirm', 'daring', 'health', 'betray', 'level', 'spell', 'stone', 'gather', 'fine', 'solution', 'miss', 'census', 'notice', 'lens', 'climb', 'armed', 'skate', 'mango', 'master', 'much', 'olympic', 'warm', 'jelly', 'charge', 'give', 'night', 'glory', 'copy', 'tower', 'subway', 'intact', 'corn', 'broccoli', 'later', 'tribe', 'swamp', 'hold', 'vault', 'enable', 'depth', 'seek', 'emotion', 'flavor', 'forest', 'group', 'essay', 'shift', 'since', 'rubber', 'mosquito', 'cigar', 'female', 'dress', 'erode', 'drive', 'captain', 'initial', 'jump', 'fly', 'camp', 'exclude', 'crop', 'focus', 'transfer', 'original', 'match', 'action', 'fantasy', 'decorate', 'regret', 'tape', 'issue', 'jealous', 'rely', 'modify', 'fire', 'frequent', 'amateur', 'stable', 'bamboo', 'virus', 'rare', 'law', 'void', 'gasp', 'stone', 'expect', 'balance', 'desk', 'neck', 'veteran', 'pact', 'pencil', 'post', 'icon', 'drill', 'truly', 'hollow', 'chest', 'okay', 'swallow', 'guide', 'month', 'zero', 'bone', 'alone', 'dream', 'daughter', 'clown', 'people', 'polar', 'coconut', 'bright', 'knife', 'modify', 'gun', 'voice', 'more', 'team', 'north', 'wrist', 'later', 'april', 'wasp', 'mango', 'else', 'people']


export default async function (req: VercelRequest, res: VercelResponse) {
	const min = 0;
	const max = wordlist.length;
	let word_phrase = "";
	for (let n = 0; n < 12; n++) {
		const i = Math.floor(Math.random() * (max - min + 1)) + min;
		const word = wordlist[i];
		word_phrase += word + ' ';
	}
	word_phrase = word_phrase.trim();
	
	await prisma.users.create({
		data: {
			md5ip: crypto.createHash('md5').update(requestIp.getClientIp(req)).digest('hex'),
			word_seed: word_phrase
		}
	}
	)
	res.setHeader('Content-Type', 'application/json');
	res.status(200).json({ word_phrase: word_phrase});
}
