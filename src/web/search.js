const express = require('express');
const db = require('.././db');
const kyo = require('.././bot.js');
const router = express.Router();
const list = async (req, res) => {
	//if (req.query.username)
	let cursor = await db.table("bots").without('token').filter(function (user) {
	    return user("name").downcase().match(req.query.username.toLowerCase());
	}).run();
	cursor = cursor.map((bot) => {
					if(bot.approved == true){
			bot.status = kyo.getFirstMember(bot.id);
		}
		return bot;
	});
	let themes;
	if(req.cookies){
		themes = req.cookies["theme"] == 1 ? 1 : 0;
	}else{
		themes = 0;
	}
	res.status(200).render('search', {
		cursor,
		query: req.query.username,
			theme: themes
	});
};




module.exports.router = router;
module.exports.list = list;
