const db = require('./../db.js');
module.exports = async (kyo, user)=> {
	if (user && user.bot && user.avatar) {
		const bot = await db.table('bots').get(user.id);
		if (bot && user.avatar !== bot.avatar) {
			db.table('bots')
				.get(user.id)
				.update({
					avatar: user.avatarURL || user.defaultAvatarURL
				})
				.run();
			}
		}
}
