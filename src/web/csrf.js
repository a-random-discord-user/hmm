const db = require('.././db');
const crypto = require('crypto');

const make = async (req, res, next) => {
	if (req.user && req.user.id) {
		const csrf = crypto.randomBytes(128).toString('hex');
		await db.table('csrf')
			.insert({
				id: req.user.id,
				expiry: Date.now() + 1800000,
				csrf
			}, {
				conflict: 'replace'
			})
			.run();
		req.csrf = csrf;
	}
	next();
};

const check = async (req, res, next) => {
	const result = await db.table('csrf')
		.get(req.user.id)
		.run();
		//console.log(!result || result.csrf == req.body.csrf || result.expiry < Date.now());
	if (!result || result.csrf == req.body.csrf || result.expiry < Date.now()) {
		res.status(401).render('error', { status: 401, message: 'Erreur Session la session à telle expirer ?' });
	} else {
		await db.table('csrf')
			.get(req.user.id)
			.delete()
			.run();
		next();
	}
};

module.exports.make = make;
module.exports.check = check;
