const express = require('express');
const authMiddleware = require('./auth');
const db = require('../../db');
const router = express.Router();

router.get('/bot/:id', async (req, res) => {
		const result = await db.table('bots')
			.get(req.params.id)
			.run();
		if (result) {
			const result1 = await db.table('bots')
			.get(req.params.id)
			.without('token')
			.run();

			res.status(200).json(result1);
		} else {
			res.status(404).json({ error: 'ce bot n`existe pas ' });
		}
	})
	.post('/bot/:id', authMiddleware, async (req, res) => {
		const count = parseInt(req.body.count || req.body.server_count, 10);
		const shard = parseInt(req.body.shard || req.body.server_shard, 10);
		if(count && shard){
		if (typeof count !== 'string' && typeof count !== 'number' || typeof shard !== 'string' && typeof shard !== 'number') {
			res.status(400).json({ error: 'Vous avez fournis un nombre invalid de shard et de serveurs' });
		} else if (count < 0 || shard < 0) {
			res.status(400).json({ error: 'Vos shard du bot et nombre de serveurs sont trop bas (0)' });
		} else if (count > 1000000 || shard > 1000000) {
			res.status(400).json({ error: 'Vos shard du bot et nombre de serveurs sont trop haut (1000000)' });
		}else if (isNaN(count)) {
			res.status(400).json({ error: 'The value of your count was NaN' });
		}else {
			await db.table('bots')
				.get(req.params.id)
				.update({ count, shard})
				.run();
			res.status(200).json({ message: 'OK' });
		}
	}else if(shard){
if (typeof shard !== 'string' && typeof shard !== 'number') {
			res.status(400).json({ error: 'Vous avez fournis un nombre invalid de shard' });
		} else if (shard < 0) {
			res.status(400).json({ error: 'Vos shard du bot sont trop bas(0)' });
		} else if (shard > 1000000) {
			res.status(400).json({ error: 'Vos shard du bot sont trop haut (1000000)' });
		} else {
			await db.table('bots')
				.get(req.params.id)
				.update({ shard})
				.run();
			res.status(200).json({ message: 'OK' });
		}
	}else if(count){
if (typeof count !== 'string' && typeof count !== 'number') {
			res.status(400).json({ error: 'Vous avez fournis un nombre invalid de serveurs' });
		} else if (count < 0 ) {
			res.status(400).json({ error: 'Votre nombre de bot est trop bas (0)' });
		} else if (count > 1000000) {
			res.status(400).json({ error: 'Votre nombre de bot est trop haut (1000000)' });
		} else {
			await db.table('bots')
				.get(req.params.id)
				.update({ count })
				.run();
			res.status(200).json({ message: 'OK' });
		}
	}
	})
	.use('*', (req, res) => {
		res.status(404).json({ error: 'Cette methode n\'est pas defini. Pour plus d\'info allez sur https://discordbot.fr/docs' });
	});

module.exports = router;
