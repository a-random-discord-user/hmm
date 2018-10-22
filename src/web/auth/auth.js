const config = require('config');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const db = require('../../db');

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
	db.table('users')
		.get(id)
		.run()
		.then((user) => {
			done(null, user);
		});
});

// DiscordApp
passport.use(new DiscordStrategy(
	{
		clientID: config.get('discord').clientID,
		clientSecret: config.get('discord').clientSecret,
		scope: config.get('discord').scope,
		callbackURL: `${config.get('webserver').location}auth/callback` || `${config.get('webserver').location2}auth/callback`
	},
	(accessToken, refreshToken, profile, done) => {
		if (accessToken !== null) {
			db.table('users')
				.insert(profile, {
					conflict: 'replace'
				})
				.run()
				.then(() => {
					done(null, profile);
				})
				.catch((err) => {
					throw err;
				});
		}
	}
));

module.exports = passport;
