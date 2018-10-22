const fs = require('fs');

const commands = {};
const categories = {};

// Register valid commands from "cmds"
fs.readdir('./src/events/cmds/', (err, items) => {
	items.forEach((item) => {
		const file = item.replace(/\.js/g, '');
		const cmd = require(`./cmds/${file}`); // eslint-disable-line global-require, import/no-dynamic-require
		categories[file] = cmd;
		cmd.forEach((com) => {
			com.aliases.forEach((alias) => {
				if (commands[alias]) {
					throw new Error(`Alias ${alias} from ${file} was already assigned to another command!`);
				} else {
					commands[alias] = com;
				}
			});
		});
	});
});

module.exports = { commands, categories };
