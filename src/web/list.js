const express = require('express');
const csrf = require('./csrf');
const user = require('./user');
const db = require('.././db');
const kyo = require('.././bot.js');
const router = express.Router();
const list = async (req, res) => {
		//let chemin = req.path.substring(req.path.lastIndexOf("/") + 1) & req.params.id;
	let bots = await db.table('bots')
		.without('token')
		.merge(bot => ({
			ownerinfo: bot('owner')
				.default([])
				.append(bot('owner'))
				.map(id => db.table('users').get(id))
				.default({ username: 'Inconnu', discriminator: '0000' }),
			//owners: bot('owners').default([]),
			//ownerinfo: db.table('users').get(bot('owner')),
			users: db.table('user').get(bot('owner')),

		}))
		.run();

	if (typeof res.locals.approve === 'boolean') {
		bots = bots.filter(bot => bot.approved === res.locals.approve);
	}
	bots = bots.map((bot) => {
		if (req.user && (bot.owner.includes(req.user.id) || req.user.admin)) {
			bot.editable = true;
			}
			if(bot.approved == true){
				bot.status = kyo.getFirstMember(bot.id);
				//console.log(bot.status);		
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
		bots = bots.filter(bot => bot.owner.includes(res.locals.owner));//on verif si il faut add id ou pas ?
	}
	let themes;
	if(req.cookies){
		themes = req.cookies["theme"] == 1 ? 1 : 0;
	}else{
		themes = 0;
	}
	res.status(200).render('list', {
		bots,
		theme: themes
	});
};

router.get('/', (req, res) => {
let cursor = db.table("bots").without('token').filter(function (user) {
    return user("name").downcase().match(`Ce`.toLowerCase());
}).run();


//db.table('bots').without('token').filter({ name : 'Cel'}).run()
cursor = cursor.map((bot) => {
	return bot;
});
  var user = cursor;
  console.log(user)
	res.redirect('/');
})
	.get('/queue',user.admin, csrf.make, (req, res, next) => {
		// Affiche que les bots non approuver 
		res.locals.approve = false;
		next();
	}, list)
	/*.get('/:id', csrf.make, (req, res, next) => {
		res.locals.owner = req.params.id;
		next();
	}, list);*/


module.exports.router = router;
module.exports.list = list;
