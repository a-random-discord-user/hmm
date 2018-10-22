const config = require('config');
const { commands } = require('./cmds');
const kyo = require('./../bot.js');

const prefixes = config.get('discord').prefix;


const clean = (msg, content) => {
	let cleanContent = content;

	if (msg.mentions) {
		msg.mentions.forEach((mention) => {
			if (msg.channel.guild) {
				const member = msg.channel.guild.members.get(mention.id);
				if (member) {
					cleanContent = cleanContent.replace(new RegExp(`<@!${mention.id}>`, 'g'), `@${member.nick}` || mention.username);
				}
			}
			cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, 'g'), `@${mention.username}`);
		});
	}

	if (msg.channel.guild && msg.roleMentions) {
		msg.roleMentions.forEach((roleID) => {
			const role = msg.channel.guild.roles.get(roleID);
			const roleName = role ? role.name : 'deleted-role';
			cleanContent = cleanContent.replace(new RegExp(`<@&${roleID}>`, 'g'), `@${roleName}`);
		});
	}

	msg.channelMentions.forEach((id) => {
		const channel = kyo.getChannel(id);
		if (channel && channel.name && channel.mention) {
			cleanContent = cleanContent.replace(channel.mention, `#${channel.name}`);
		}
	});

	return cleanContent.replace(/@everyone/g, '@\u200beveryone').replace(/@here/g, '@\u200bhere');
};

module.exports = async (msg, callback) => {
	const mss = {};

	// Set default values
	mss.content = msg.content.trim() || '';
	mss.prefix = prefixes.find(prefix => mss.content.toLowerCase().startsWith(prefix)) || '';
	mss.command = '';
	mss.input = '';
	mss.admin = 0;


	// If there's a prefix, get rid of the prefix and check for any command
	if (mss.prefix && !msg.author.bot) {
		const noprefix = mss.content.substring(mss.prefix.length).trim();
		mss.command = Object.keys(commands).find(command => noprefix.startsWith(command)) || '';
		if (mss.command) {
			mss.input = noprefix.substring(mss.command.length).trim();
			mss.cleanInput = clean(msg, mss.input);
		}
	}

	if (config.get('discord').admins.includes(msg.author.id)) {
		mss.admin = 3;
	} else if (msg.member && msg.member.permission.has('ADMINISTRATOR')) {
		mss.admin = 2;
	} else if (msg.member && (msg.member.permission.has('kickMembers') || msg.member.permission.has('banMembers'))) {
		mss.admin = 1;
	}
	msg.mss = mss;
//	kyo.I18n.use("fr");
//	msg.setLocale((locale && locale.lang) || 'fr');
	callback();
};
