const config = require('config');
const kyo = require('.././bot.js');

const lanchsetup = (req, res, next) => {
	if (req.user && kyo.kyo.startTime) {
		const user = kyo.kyo.guilds.get('344955119005073409').members.get(req.user.id);

		if (user) {
			req.user.admin = user.roles.some(role => config.get('discord').roles.includes(role));
		} else {
			req.user.admin = false;
		}
	}

	res.locals.user = req.user;

	next();
};

const auth = (req, res, next) => {
	if (req.user) {
		next();
	} else {
		let themes;
		if(req.cookies){
			themes = req.cookies["theme"] == 1 ? 1 : 0;
		}else{
			themes = 0;
		}
		res.status(401).render('error', { status: 401, message: 'Vous n\'êtes pas connecté.', theme: themes });
	}
};

const admin = (req, res, next) => {
	if (req.user && req.user.admin) {
		next();
	} else {
		let themes;
		if(req.cookies){
			themes = req.cookies["theme"] == 1 ? 1 : 0;
		}else{
			themes = 0;
		}
		res.status(400).render('error', { status: 400, message: 'Vous n\'êtes pas autorisé à acceder à cette page.', theme: themes });
	}
};

const kyonna = (req, res, next) => {
	if (req.user && req.user.kyonna) {
		next();
	} else if (req.user) {
		let themes;
		if(req.cookies){
			themes = req.cookies["theme"] == 1 ? 1 : 0;
		}else{
			themes = 0;
		}
		res.status(400).render('error', { status: 400, message: 'Vous n\'êtes pas dans le serveur.', theme: themes });
	} else {
		let themes;
		if(req.cookies){
			themes = req.cookies["theme"] == 1 ? 1 : 0;
		}else{
			themes = 0;
		}
		res.status(401).render('error', { status: 401, message: 'Vous n\'êtes pas connecté.',theme: themes });
	}
};

module.exports = {
	lanchsetup, auth, admin, kyonna
};
