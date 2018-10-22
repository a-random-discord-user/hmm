const express = require('express');
const auth = require('./auth');

const router = express.Router();

router.use('/callback', auth.authenticate('discord'), (req, res) => {
	res.send("Vous pouvez maintenant fermer cette page et actualiser la page d'où vous êtes venu pour que les changements prennent place.");
})
	.get('/', auth.authenticate('discord'))
	.get('/userinfotest', (req, res) => {
		if (req.user && req.user.id) {
			res.json(req.user);
		} else {
			res.status(404).json(null);
		}
	})
	.use('/logout', (req, res) => {
		req.logout();
		res.redirect("back");
	});

module.exports = router;
