const config = require('config');
module.exports = (kyo) =>{
	console.log('Discord Bot is online');

	kyo.editStatus('online', {
		name: config.get('discord').game,
		type: 0
	});
}