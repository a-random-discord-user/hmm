const express = require('express');
const user = require('./user');
const csrf = require('./csrf');
const db = require('.././db');
const kyo = require('../bot');
const router = express.Router();
const validate = (req, res, next) => {
	let themes;
	if(req.cookies){
		themes = req.cookies["theme"] == 1 ? 1 : 0;
	}else{
		themes = 0;
	}
	if (typeof req.body.id !== 'string') {
		res.status(400).render('error', { status: 400, message: 'You provided an invalid ID', theme: themes });
	} else if (typeof req.body.bio !== 'string') {
		res.status(400).render('error', { status: 400, message: 'You provided an invalid bio', theme: themes });
	} else if (req.body.bio > 200) {
		res.status(400).render('error', { status: 400, message: 'You provided a HTML based long description that was too long (200000)', theme: themes });
	} else if (/\D/.test(req.body.id)) {
		res.status(400).render('error', { status: 400, message: 'Your bot ID had values other than digits', theme: themes });
	} else {
		if (!req.body.github) { // si github n'est pas la on va faire que la value sois null.
			req.body.github = null;
		}
		if (!req.body.youtube) { // si youtube n'est pas la on va faire que la value sois null.
			req.body.youtube = null;
		}		
		if (!req.body.twitter) { // si twitter n'est pas la on va faire que la value sois null.
			req.body.twitter = null;
		}
		if (!req.body.facebook) { // si facebook n'est pas la on va faire que la value sois null.
			req.body.facebook = null;
		}
		if (!/^https:\/\//.test(req.body.background) && req.body.background) {
					res.status(400).render('error', { status: 400, message: 'Your background must use HTTPS', theme: themes });
		}

		if (!req.body.background) { // si facebook n'est pas la on va faire que la value sois null.
			req.body.background = null;
		}

		next();
	}
};
const users = async (req, res) =>{
	const result = await db.table('user')
		.get(req.params.id || req.body.id)
		.run();
}
const owns = async (req, res, next) => {
	const result = await db.table('users')
		.get(req.params.id || req.body.id)
		.run();
	if (!result) {
		res.status(404).render('error', { status: 404, message: 'user not found', theme: themes });
	} else if (req.user.id === result.id || req.user.admin) {
		res.locals.bot = result;
		next();
	} else {
		res.status(400).render('error', { status: 400, message: 'You are not allowed to edit other\'s users', theme: themes });
	}
};

const list = async (req, res, next) => {
			const exists = await db.table('users')
			.get(req.params.id)
			.run();
			const test = db.table('user').run();
			console.log(test);
		if (exists) {
			let bots = await db.table('bots')
			.without('token')
			.merge(info => ({
				ownerinfo: db.table('users').get(req.params.id).without('accessToken'),
				users: db.table('user').get(req.params.id || req.body.id),
			}))
			.run();

			if (typeof res.locals.approve === 'boolean') {
				bots = bots.filter(bot => bot.approved === res.locals.approve);
			}
			bots = bots.map((bot) => {
				if ((req.user && req.user.id) === bot.owner || (req.user && req.user.admin)) {
					bot.editable = true;
					}
					if(bot.approved == true){
				bot.status = kyo.getFirstMember(bot.id);
			}
				bot.random = Math.random();
				return bot;
			});


			if (res.locals.approve === false) {
				bots = bots.sort((a, b) => a.timestamp - b.timestamp);
			} else {
				bots = bots.sort((a, b) => a.random - b.random);
			}

			if (res.locals.owner) {
				//bots = bots.filter(bot =>console.log(bot.owner));// bot.owner === res.locals.owner);
				bots = bots.filter(bot => (req.user && req.user.id === bot.owner) || bot.owner.includes(res.locals.owner));
			}
		/*res.locals.owner = req.params.id;
				next();*/
				console.log(bots);
					let themes;
	if(req.cookies){
		themes = req.cookies["theme"] == 1 ? 1 : 0;
	}else{
		themes = 0;
	}
			res.status(200).render('user', {
				bots,
				theme: themes
			});
		} else {
			let themes;
			if(req.cookies){
				themes = req.cookies["theme"] == 1 ? 1 : 0;
			}else{
				themes = 0;
			}
				res.status(404).render('error', {
					csrf: res.csrf,
					status: 404,
					message: "utilisateur non trouver",
					theme: themes
				});
			}
		}
router.get('/:id', csrf.make, async (req, res, next) => {
		// Check if the count is empty

		res.locals.owner = req.params.id;
			next();
					//res.redirect('/list/' + req.params.id);
					//
		
	}, list)
.get('/:id/edit', user.auth, csrf.make, owns, async (req, res) => {
		let themes;
		if(req.cookies){
			themes = req.cookies["theme"] == 1 ? 1 : 0;
		}else{
			themes = 0;
		}
		// Display the edit screen with the bot's items
		const test = await db.table('user')
		.get(req.params.id || req.body.id)
		.run();
	 	res.render('useredit.ejs', {
			csrf: req.csrf,
			users: users,
			test: test,
			theme: themes
		});
	})
	//.post('/:id/edit', user.auth, csrf.check, owns, validate, async (req, res) => {
	.post('/:id/edit', user.auth, csrf.check, owns, validate, async (req, res) => {
		// Edit only the bits that need to be edited
	const result = await db.table('user')
		.get(req.params.id || req.body.id)
		.run();

	if (!result) {
	response = await db.table('user')
			.insert({
				id: req.body.id,
				bio: req.body.bio,
				github: req.body.github,
				youtube: req.body.youtube,
				twitter: req.body.twitter,
				facebook: req.body.facebook,
				background: req.body.background,
		}).run();
		if (response.unchanged) {
			res.render('error', {
				status: 200,
				theme: themes,
				message: 'profile non changer'
			});
		} else {
			res.redirect("/user/"+ req.body.id );
		}
			} else if (req.user.id === result.id || req.user.admin) {
		response = await db.table('user')
			.get(req.body.id)
			.update({
				bio: req.body.bio,
				github: req.body.github,
				youtube: req.body.youtube,
				twitter: req.body.twitter,
				facebook: req.body.facebook,
				background: req.body.background,
		}).run();
		if (response.unchanged) {
			res.render('error', {
				status: 200,
				theme: themes,
				message: 'profile non changer'
			});
		} else {
			res.redirect("/user/"+ req.body.id );
		}
	}		

	})

module.exports = router;
