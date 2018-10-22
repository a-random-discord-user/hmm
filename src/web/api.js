const express = require('express');
const v1 = require('./api/v1');

const router = express.Router();

router.get('/', (req, res) => {
	res.status(404).json({ error: 'Salut il n\'y as rien ici allez salut :P' });
})
	.use('/v1', v1)
	.use('*', (req, res) => {
		res.status(404).json({ error: 'Cette version de l\'API n\'existe pas' });
	})

module.exports = router;
