const config = require('config');
const { commands } = require('./cmds');
const handler = require('./handler');
module.exports = (kyo, msg) =>{
	        kyo.I18n.use("fr");
	handler(msg, () => {
		if (msg.mss.command && msg.mss.admin >= commands[msg.mss.command].admin) {
			commands[msg.mss.command].command(msg);
		}
	});
}
