const db = require('../../db');

module.exports = async (req, res, next) => {
	const auth = req.get('Authorization');

	const bot = await db.table('bots')
		.get(req.params.id)
		.run();

	if (!bot) {
		res.status(404).json({ error: 'Ce bot n\'existe pas.' });
	} else if (auth === bot.token) {
		next();
	} else {
		res.status(401).json({ error: 'Erreur d\'autorisation header manquant.' });
	}
};
