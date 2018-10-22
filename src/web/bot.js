const express = require('express');
const user = require('./user');
const csrf = require('./csrf');
const db = require('.././db');
const kyo = require('.././bot.js');
const marked = require('marked');
const crypto = require('crypto');
const reasons = require('../../data/reasons.json');
const categories = require('../../data/categories.json');
const config = require('config');
const request = require('request');
const cheerio = require('cheerio');

const router = express.Router();
marked.setOptions({
	sanitize: true
});

const on = [
	'onchange',
	'onclick',
	'onmouseover',
	'onmouseout',
	'onkeydown',
	'onload'
];
const validate = (req, res, next) => {
console.log(categories.category.some(category => console.log(category)));

	if (typeof req.body.id !== 'string') {
		res.status(400).render('error', { status: 400, message: 'L\'id du bot est invalide' });
	} else if (typeof req.body.shortDesc !== 'string') {
		res.status(400).render('error', { status: 400, message: 'La description courte et invalide' });
	}/* else if (typeof req.body.type !== 'string') {
		res.status(400).render('error', { status: 400, message: 'You provided an invalid type' });
	} else if (!config.get('desc').description.some(type => req.body.type === type)) {
		res.status(400).render('error', { status: 400, message: 'You provided an incorrect type' });
	}*/ else if (typeof req.body.descitype !== 'string') {
		res.status(400).render('error', { status: 400, message: 'You provided an invalid long description' });
	} else if (typeof req.body.count !== 'string') {
		res.status(400).render('error', { status: 400, message: 'You provided an invalid guild count' });
	} else if (req.body.id.length > 70) {
		res.status(400).render('error', { status: 400, message: 'You provided a bot id that was too long (70)' });
	} else if (req.body.shortDesc.length > 200) {
		res.status(400).render('error', { status: 400, message: 'You provided a short description that was too long (200)' });
	} else if (typeof req.body.prefix !== 'string') {
		res.status(400).render('error', { status: 400, message: 'You provided an invalid prefix' });
	} else if (req.body.avatar.length > 2000) {
		res.status(400).render('error', { status: 400, message: 'You provided an avatar that was too long (2000)' });
	} else if (/\D/.test(req.body.count)) {
		res.status(400).render('error', { status: 400, message: 'Your bot count had values other than digits' });
	} else if (parseInt(req.body.count, 10) < 0) {
		res.status(400).render('error', { status: 400, message: 'Your bot count was too low (0)' });
	} else if (parseInt(req.body.count, 10) > 1000000) {
		res.status(400).render('error', { status: 400, message: 'Your bot count was too high (1000000)' });
	}else if (req.body.descitype > 200000) {
		res.status(400).render('error', { status: 400, message: 'You provided a HTML based long description that was too long (200000)' });
	} 
	if (typeof req.body.category !== 'string') {
		res.status(400).render('error', { status: 400, message: 'La catégorie est invalide' });
	} else if (!categories.category.some(category => req.body.category === category)) {
		res.status(400).render('error', { status: 400, message: 'La catégorie est invalide' });
	}




	/*else if (req.body.type === 'iframe' && !/^https:\/\//.test(req.body.descitype)) {
		res.status(400).render('error', { status: 400, message: 'Your iframe based long description must use HTTPS' });
	} else if (req.body.type === 'iframe' && req.body.descitype > 2000) {
		res.status(400).render('error', { status: 400, message: 'You provided an iframe based long description that was too long (2000)' });
	} else if (req.body.type === 'markdown' && req.body.descitype > 20000) {
		res.status(400).render('error', { status: 400, message: 'You provided a markdown based long description that was too long (20000)' });
	}else if (req.body.prefix.length > 50) {
		res.status(400).render('error', { status: 400, message: 'You provided a prefix that was too long (50)' });
 	} else if (req.body.type === 'html' && req.body.descitype > 200000) {
		res.status(400).render('error', { status: 400, message: 'You provided a HTML based long description that was too long (200000)' });
	} */else if (/\D/.test(req.body.id)) {
		res.status(400).render('error', { status: 400, message: 'Your bot ID had values other than digits' });
	} else {
		if(!req.body.descitype){
			req.body.descitype = "</br>";
		}
		if (!req.body.invite) { // If there is no invite, make one up using the ID.
			req.body.invite = `https://discordapp.com/oauth2/authorize?client_id=${req.body.id}&scope=bot&permissions=0`;
		}
		if(!req.body.website){
			req.body.website = null;
		}if(!req.body.github){
			req.body.github = null;
		}
		// Remove duplicates, remove original owner
		

		const owners = [...new Set(req.body.owners.split(/\D+/g))]
			.filter((owner) => {
				// If the owner is blank, remove it
				if (owner === '') {
					return false;
				}

				// If the bot exists, compare to the bot owner
				if (res.locals.bot && res.locals.bot.owner) {
					return owner !== res.locals.bot.owner;
				}

				// If the bot doesn't exist, compare to the logged in user
				// Should work for adding new bots
				return owner !== req.user.id;
			});
		if (owners.length > 5) {
			res.status(400).render('error', { status: 400, message: 'You provided too many additional owners. (Maximum: 5)' });
		} else if (owners.some(owner => owner.length > 25)) {
			res.status(400).render('error', { status: 400, message: 'One or more owner IDs are too long (Maximum: 25)' });
		} else {
			req.body.owner = owners;
		}

		if (typeof req.body.invite !== 'string') {
			res.status(400).render('error', { status: 400, message: 'You provided an invalid invite' });
		} else if (req.body.invite.length > 2000) {
			res.status(400).render('error', { status: 400, message: 'You provided an invite that was too long (2000)' });
		} else if (!/^https?:\/\//.test(req.body.invite)) {
			res.status(400).render('error', { status: 400, message: 'Your invite must use HTTP or HTTPS' });
		} else {
			request({
				uri: `https://discordapp.com/api/v6/users/${req.body.id}`,
				method: 'GET',
				headers: {
					'User-Agent': config.get('useragent'),
					Authorization: `Bot ${config.get('discord').token}`
				},
				json: true
			}, (err, response, body) => {
				if (!req.body.avatar && body.avatar) {
					req.body.avatar = `https://cdn.discordapp.com/avatars/${body.id}/${body.avatar}`;
				}

				if (!req.body.name) {
					req.body.name = body.username;
				}

				if (response.statusCode === 404) {
					res.status(404).render('error', { status: 404, message: 'Discord could not find your bot.' });
				} else if (body.code) {
					res.status(500).render('error', { status: 500, message: `Discord returned error ${response.statusCode}: ${body.code} - ${body.message}` });
				} else if (!body.bot) {
					res.status(400).render('error', { status: 400, message: 'Userbots are not allowed' });
				} else if (typeof req.body.avatar !== 'string') {
					res.status(400).render('error', { status: 400, message: 'You provided an invalid avatar' });
				} else if (!/^https:\/\//.test(req.body.avatar) && req.body.avatar) {
					res.status(400).render('error', { status: 400, message: 'Your avatar must use HTTPS' });
				} else if (typeof req.body.name !== 'string') {
					res.status(400).render('error', { status: 400, message: 'You provided an invalid name' });
				} else if (req.body.name.length > 32) {
					res.status(400).render('error', { status: 400, message: 'You provided a name that was too long (32)' });
				} else {
					next();
				}
			});
		}
	}
};

const owns = level =>
	async (req, res, next) => {
		const result = await db.table('bots')
			.get(req.params.id || req.body.id)
			.run();
		if (!result) {
			res.status(404).render('error', { status: 404, message: 'Aucun bot trouver' });
		} else if ((level <= 3 && req.user.admin) || (level <= 2 && result.owner[0] === req.user.id) || (level <= 1 && result.owner.includes(req.user.id))) {
			res.locals.bot = result;
			next();
		} else {
		res.status(400).render('error', { status: 400, message: 'Vous n\'êtes pas autorisé à éditer les autres bots' });
		}
	};

router.get('/add', user.auth, csrf.make, (req, res) => {
	let themes;
	if(req.cookies){
		themes = req.cookies["theme"] == 1 ? 1 : 0;
	}else{
		themes = 0;
	}
	// Display the add screen
	res.render('add.ejs', {
		csrf: req.csrf,
		categories: categories.category,
		theme: themes
	});
})
	.post('/add', user.auth, csrf.check, validate, async (req, res) => {
		// pour en add il suffit de faire un update de la value pour tous new champs :)
		
		const response = await db.table('bots')
			.insert({
				id: req.body.id,
				name: req.body.name,
				avatar: req.body.avatar,
				lib: req.body.lib,
				invite: req.body.invite,
				count: parseInt(req.body.count, 10),
				shortDesc: req.body.shortDesc,
				prefix: req.body.prefix,
				website: req.body.website,
				github: req.body.github,
				descitype: req.body.descitype,
				shard: parseInt(req.body.shard, 10),
				categories: req.body.category,
				owner: [req.user.id].concat(req.body.owners.replace(req.user.id, '').replace(/,/g,"").split(' ')).filter(u=>u!=""),
				approved: false,
				token: crypto.randomBytes(64).toString('hex'),
				timestamp: Date.now()
			});
		if (response.errors) {
			res.status(409).render('error', {
				status: 409,
				message: ('bot existant')
			});
		} else {
			res.redirect('/bot/'+req.body.id);
			// Send message to Discord Channel
			kyo.kyo.guilds.get('344955119005073409').channels.get("383665129750921228").createMessage(`${req.user.username} a ajouté(e) \`${req.body.name}\` <@${req.body.id}> \n https://discordbots.fr/bot/${req.body.id}`);
		}
	})
	.get('/:id', csrf.make, async (req, res) => {
		let themes;
		if(req.cookies){
			themes = req.cookies["theme"] == 1 ? 1 : 0;
		}else{
			themes = 0;
		}
		// Check if the count is empty
		const exists = await db.table('bots')
			.get(req.params.id);
			
		if (exists) {
			const botinfo = await db.table('bots')
				.get(req.params.id)
				.without('token')
				.merge(info => ({
					ownerinfo: info('owner')
					.default([])
					.append(info('owner'))
					.map(id => db.table('users').get(id))
					.default({ username: 'Inconnu', discriminator: '0000' })
				}));
				if(botinfo.approved == true){
				botinfo.status = kyo.getFirstMember(req.params.id);
					
				}

			let render = '';
			if (req.user && (botinfo.owner.includes(req.user.id) || req.user.admin)) {
				botinfo.editable = true;
			}
			if (botinfo.descitype) {
				/*if (botinfo.type === 'markdown') {
					render = marked(botinfo.descitype);
				} else if (botinfo.type === 'html') {*/
					const $ = cheerio.load(botinfo.descitype);
					on.forEach(event => $('*').removeAttr(event));
					$('script').remove();
					render = $.html();				
			}
			//console.log(categories.category);
			res.render('botpage', {
				botinfo,
				csrf: req.csrf,
				owners: botinfo.ownerinfo.filter(u=> u!= null ),
				theme: themes,
				render,
			});
		} else {
			res.status(404).render('error', {
				csrf: res.csrf,
				status: 404,
				message: 'Ce bot n\'a pas été trouvé'
			});
		}
	})
	.get('/:id/edit', user.auth, csrf.make, owns(1), (req, res) => {
		let themes;
		if(req.cookies){
			themes = req.cookies["theme"] == 1 ? 1 : 0;
		}else{
			themes = 0;
		}
		// Display the edit screen with the bot's items
		//res.locals.bot.owner = res.locals.bot.owner.join(' ').replace(req.user.id, '');
		res.render('edit.ejs', {
			csrf: req.csrf,
			bot: res.locals.bot,
			descitype: req.body.descitype,
			owner: res.locals.bot.owner ? res.locals.bot.owner.join(', ') : '',
			categories: categories.category,
			theme: themes
		});
	})
	.post('/:id/edit', user.auth, csrf.check, owns(1), validate, async (req, res) => {
		// Edit only the bits that need to be edited
		// 
		const response = await db.table('bots')
			.get(req.params.id)
			.update({
				name: req.body.name,
				avatar: req.body.avatar,
				invite: req.body.invite,
				count: parseInt(req.body.count, 10),
				shortDesc: req.body.shortDesc,
				prefix: req.body.prefix,
				website: req.body.website,
				github: req.body.github,
				descitype: req.body.descitype,
				categories: req.body.category,
				shard: parseInt(req.body.shard, 10),
				owner: [req.user.id].concat(req.body.owners.replace(req.user.id, '').replace(/,/g,"").split(' ')).filter(u=>u!="")
			}).run();

		res.redirect(`/bot/${req.params.id}`);
		if (!response.unchanged) {
			if (res.locals.bot.owner.includes(req.user.id)) {
				kyo.kyo.guilds.get('344955119005073409').channels.get("383665129750921228").createMessage(`${req.user.username} a édité(e) \`${res.locals.bot.name}\` <@${res.locals.bot.id}> \n https://discordbots.fr/bot/${res.locals.bot.id}`);
			} else {
				kyo.kyo.guilds.get('344955119005073409').channels.get("383665129750921228").createMessage(`<@${req.user.id}> a édité(e) \`${res.locals.bot.name}\` <@${res.locals.bot.id}> par ${res.locals.bot.owner.map(a => "<@"+a +">")} \n https://discordbots.fr/bot/${res.locals.bot.id}`);
			}
		}
	})
	.get('/:id/delete', user.auth, csrf.make, owns(2), (req, res) => {
		let themes;
		if(req.cookies){
			themes = req.cookies["theme"] == 1 ? 1 : 0;
		}else{
			themes = 0;
		}
		// View a page before deleting the bot
		res.render('delete.ejs', {
			csrf: req.csrf,
			title: 'Delete Bot',
			theme: themes
		});
	})
	.post('/:id/delete', user.auth, csrf.check, owns(2), (req, res) => {
		// Delete the bot
		db.table('bots')
			.get(req.params.id)
			.delete()
			.run();

		res.redirect('/');
		const member = kyo.kyo.guilds.get("344955119005073409").members.get(user.id);
			if (!member){
		kyo.kyo.guilds.get('344955119005073409').channels.get("383665129750921228").createMessage(`<@${req.user.id}> a supprimé(e) \`${res.locals.bot.name}\` <@${res.locals.bot.id}> par ${res.locals.bot.owner.map(a=>`<@${a}>`)}`);
			}else{
		kyo.kyo.guilds.get('344955119005073409').channels.get("383665129750921228").createMessage(`<@${req.user.id}> a supprimé(e) \`${res.locals.bot.name}\` <@${res.locals.bot.id}> par ${res.locals.bot.owner.map(a=>`<@${a}>`)}`);
			member.kick();
			}
	})
	.get('/:id/token', user.auth, csrf.make, owns(1), (req, res) => {
		let themes;
		if(req.cookies){
			themes = req.cookies["theme"] == 1 ? 1 : 0;
		}else{
			themes = 0;
		}
		// Display the token for this bot
		res.render('token.ejs', {
			csrf: req.csrf,
			bot: res.locals.bot,
			theme: themes
		});
	})
/*	.get('/:id/iframe', async (req, res) => {
		const result = await db.table('bots')
			.get(req.params.id);

		if (result && result.type === 'html') {
			res.send(result.longDesc);
		} else {
			res.status(404).render('error', {
				status: 404,
				message: ('error_bot_html_not_found')
			});
		}
	})*/
	.post('/:id/token', user.auth, csrf.check, owns(1), async (req, res) => {
		await db.table('bots')
			.get(req.params.id)
			.update({
				token: crypto.randomBytes(64).toString('hex')
			}, {
				returnChanges: true
			});
		res.redirect(req.originalUrl);
	})
	.post('/:id/approve', user.auth, csrf.check, user.admin, async (req, res) => {
		const previous = req.header('Referer') || '/';
		const result = await db.table('bots')
			.get(req.params.id)
			.update({
				approved: true
			}, {
				returnChanges: true
			});
		const member = kyo.kyo.guilds.get("344955119005073409").members.get(result.changes[0].old_val.id);
		if (member) {
			if (res.skipped) {
				res.status(404).render('error', { status: 404, message: 'Aucun bot trouver' });
			} else if (!result.changes) {
				res.redirect(previous);
			} else {
				member.removeRole(config.get('kyonna').unverified);
				member.addRole(config.get('kyonna').bot);
				kyo.kyo.guilds.get('344955119005073409').channels.get("383665129750921228").createMessage(`<@${req.user.id}> a approuvé \`${result.changes[0].old_val.name}\` <@${result.changes[0].old_val.id}> par ${result.changes[0].old_val.owner.map(a=>`<@${a}>`)}`);
				res.redirect(previous);
			}
		} else {
			res.status(500).render('error', { status: 500, message: 'Le bot n\'est pas présent dans le serveur. Merci de l\'inviter et de lui appliquer manuellement le role.' });
		}
	})
	.get('/:id/remove', user.auth, csrf.make, user.admin, async (req, res) => {
		let themes;
		if(req.cookies){
			themes = req.cookies["theme"] == 1 ? 1 : 0;
		}else{
			themes = 0;
		}
		res.render('remove', {
			csrf: req.csrf,
			reasons: reasons.remove,
			theme: themes
		});
	})
	.post('/:id/remove', user.auth, csrf.check, user.admin, async (req, res) => {
		const user = await db.table('bots')
			.get(req.params.id);
		if (!user) {
			res.status(404).render('error', { status: 404, message: 'Aucun bot trouver' });
		} else if (typeof req.body.reason !== 'string' || typeof req.body.description !== 'string' || req.body.description.length > 1000) {
			res.status(400).render('error', { status: 400, message: 'La raison ou la description est invalide' });
		} if (req.body.reason) {
			db.table('bots')
				.get(req.params.id)
				.delete()
				.run();
			res.redirect('/');//kyo eval kyo.guilds.get("344955119005073409").members
			const member = kyo.kyo.guilds.get("344955119005073409").members.get(user.id);
			let liens = req.body.description.split(' ').filter(a=>a.startsWith("https://cdn.discordapp.com/"));
			let content;
			if(liens.length>0){
				req.body.description = req.body.description.split(' ').filter(a=>{!a.startsWith("https://cdn.discordapp.com/")}).join(' ');
				content = {
					content:`<@${req.user.id}> a rejeté \`${user.name}\` <@${user.id}> par ${user.owner.map(a=>`<@${a}>`)} \`\`\` Pour: ${(`${req.body.reason}`)} \n ${req.body.description} \`\`\``,
					embed:{
						image:{
							url:liens[0]
						}
					}
				};
			}else{
				content = `<@${req.user.id}> a rejeté \`${user.name}\` <@${user.id}> par ${user.owner.map(a=>`<@${a}>`)} \`\`\` Pour: ${(`${req.body.reason}`)} \n ${req.body.description} \`\`\``;
			}
			kyo.kyo.guilds.get('344955119005073409').channels.get("383665129750921228").createMessage(content);
			if (member){
				member.kick();
			}
		} else {
			res.status(400).render('error', { status: 400, message: 'Raison invalide' });

		}
	});

module.exports = router;
