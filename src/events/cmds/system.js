const { kyo } = require('./../../bot.js');
const cmds = require('./../cmds');
const { exec } = require('child_process');
const db = require('./../../db');
const os = require("os");
const config = require("config");
const request = require("request");
const hardwareinfo = `(${os.arch()}) ${os.cpus()[0].model} @ ${os.cpus()[0].speed} MHz`;
const softwareinfo = `[${os.type()}] ${os.release()}`;
const version = `0.1`;
const moment = require("moment");
moment.locale("fr");
const obj = [];
module.exports = [{
	aliases: [
		'ping'
	],
	name: 'ping',
	uses: 1,
	admin: 0,
	command: (msg) => {
		var debut = new Date();
		request('https://google.fr', async(error, response, body) =>{
			var fin = new Date();
			var tempsMs = fin.getTime() - debut.getTime();
		msg.channel.createMessage({
			embed: {
		        type: 'rich',
		        description: '!Pong',
		        fields: [{
		          name: 'Google!',
		          value:  tempsMs/(5*2) + ' ms',
		          inline: true
		        },{
		        	name : 'Discord API',
		          	value: `${Math.round(kyo.requestHandler.latencyRef.latency)} ms`,
		          	inline: true
		        },{
		         	name: 'Local',
		          	value: `**${(debut  - msg.timestamp)/(5*2)}ms**`,
		          	inline: true
		        },{
		            name: `Shard 0`,
		            value: `${kyo.shards.map(shard => `${shard.latency}ms`)}`,
		            inline: true
		        }],
		        color: 3447003,
		        footer: {
		            text: kyo.I18n.translate`by Jorisvidéo`,
		            proxy_icon_url: ' '
		        },
		           author: {
		            name: msg.author.username,
		            icon_url: msg.author.avatarURL,
		            proxy_icon_url: ' '
		        },
		        thumbnail: { url :`${kyo.user.avatarURL}` }

		    }});
		});
	}
}, {
	aliases: [
		'eval'
	],
	name: 'eval',
	uses: 1,
	admin: 3,
	command: (msg) => {
		  try {
    const code = msg.mss.input;
    let evaled = eval(code);
    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
    evaled = evaled.replace(new RegExp(kyo.token, 'g'), 'NO FOR YOUR I LOVE THE UNICORN SPACE #SPACECORN');
                    if(evaled.length > 1900) {
                    evaled = evaled.substr(0, 1900)
                    evaled = evaled + "..."
                }
console.log(evaled);

    msg.channel.createMessage("```javascript\n"+evaled+"```");
  } catch (e) {
    msg.channel.createMessage("```javascript\n"+e+"```");
  }
	}
}, {
	aliases: [
		'help'
	],
	name: 'help',
	uses: 3,
	admin: 0,
	command: (msg) => {
				msg.channel.createMessage({
					embed: {
						title: kyo.I18n.translate`help for the commands`,
						color: 3447003,
						thumbnail: { url :`${kyo.user.avatarURL}` },
						fields: [{
							name: "ping",
							value: kyo.I18n.translate`ping`
						},{
							name: 'about',
							value: kyo.I18n.translate`helpabout`
						},{
							name: `help`,
							value: kyo.I18n.translate`help`
						},{
							name: `get`,
							value: kyo.I18n.translate`get`
						}]
						/* cmds.categories[category]
							.filter(command => msg.mss.admin >= command.admin)
							.map(command => ({
								name: command.aliases[0],
								value: kyo.I18n.translate`${command.name}_desc`
							}))*/
					}
				});
	}
}, {
	aliases: [
		'about'
	],
	name: 'about',
	uses: 1,
	admin: 0,
	command: (msg) => {
	let upTime = Math.round(process.uptime()); //.split(".");
    let upTimeSeconds = upTime;
    let upTimeOutput = "";
        if (upTime<60) {
            upTimeOutput = `${upTime}s`;
        } else if (upTime<3600) {
            upTimeOutput = `${Math.floor(upTime/60)}m ${upTime%60}s`;
        } else if (upTime<86400) {
            upTimeOutput = `${Math.floor(upTime/3600)}h ${Math.floor(upTime%3600/60)}m ${upTime%3600%60}s`;
        } else if (upTime<604800) {
            upTimeOutput = `${Math.floor(upTime/86400)}d ${Math.floor(upTime%86400/3600)}h ${Math.floor(upTime%86400%3600/60)}m ${upTime%86400%3600%60}s`;
        }
        const softwareram = `${Math.round((process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100)} MB`;
		const embed = {
			embed: {
				fields: [
					{
						name:kyo.I18n.translate`Owner`,
						value: `Discord Bot FR`,
						inline: true
					},{
						name: kyo.I18n.translate`Servers`,
						value: kyo.guilds.size,
						inline: true
					},{
						name: kyo.I18n.translate`System Time`,
						value: new Date().toLocaleTimeString('fr-FR', { hour: "numeric", minute: "numeric"}),
						inline: true
					},{
						name: kyo.I18n.translate`info_nodejs`,
						value: process.version,
						inline: true
					},{
						name: 'Eris',
						value: '0.8.2',
						inline: true
					},{
						name: kyo.I18n.translate`Uptime`,
						value: upTimeOutput,
						inline: true
					},{
						name: kyo.I18n.translate`ram`,
						value: softwareram,
						inline: true
					},
					{
						name: kyo.I18n.translate`hardwareinfo`,
						value: hardwareinfo,
						inline: true
					},
					{
						name: kyo.I18n.translate`softwareinfo`,
						value: softwareinfo,
						inline: true
					}
				],
				color: 3447003,
				thumbnail: { url :`${kyo.user.avatarURL}` }
			}
		};

		msg.channel.createMessage(embed);
	}
},{
		aliases: [
			'get'
		],
		name: 'get',
		uses: 1,
		admin: 0,
		command: async (message) => {
			const getID = string => string.replace(/\D/g, '');
			const search = getID(message.mss.input)? getID(message.mss.input) : message.mss.input;

				if(search.length === 0){
					var bot = await db.table('bots').without("descitype", "invite","owner","longDesc",'token',"website","github","shard");
					for(var i=0; i<bot.length; i++){
						var val = bot[i].name;
						obj.push(val);
					}
					return message.channel.createMessage({
					embed: {
						type: 'rich',
						url: `${config.get('webserver').location}`,
						thumbnail: { url :`${kyo.user.avatarURL}` },
						fields: [{
						name: `Liste des bots :`,
						value: `${obj.join(" \n")}`,
						inline: true
					}]
					}
				});
					message.channel.createMessage(obj.join(" \n"));
				}else{
			const idtest = kyo.users.filter(u => u.bot == true && u.username.toLowerCase().includes(search.toLowerCase())|| u.id === search);
			if(idtest.length != 0){
			var id = idtest[0].id;
			}else{
			const exists = await db.table('bots').get(search);
				if(exists){
				var id = search;
				}else{
				return message.channel.createMessage(kyo.I18n.translate`bot_notfound`);
				}
			}
				
			const bot = await db.table('bots').get(id);
			//console.log(bot);
			//console.log(JSON.stringify(id));
			if (bot) {
				embed_fields = [
							{
								name: "Approuvé",
								value: `${bot.approved ? `:white_check_mark:` : `:x:`}`,
								inline: true
							},
							{
								name: "Lib",
								value: bot.lib,
								inline: true
							},
							{
								name: kyo.I18n.translate`botinfo_get_count`,
								value: bot.count,
								inline: true
							},
							{
								name: `Prefix`,
								value: `${bot.prefix}`,
								inline: true
							},
							{
								name: `Shards`,
								value: `${bot.shard}`,
								inline: true	
							},
							{
								name: `Date d'ajout`,
								value: `${moment(bot.timestamp).format("D MMMM Y à LTS")}`,
								inline: true
							}
						];
						if(bot.categories != null){
							embed_fields.push({
								name: `Catégory`,
								value: `${bot.categories}`,
								inline: true
							});
						}
						if(bot.github != null){
						embed_fields.push({
								name: `Github`,
								value: `[repo](${bot.github})`,
								inline: true
							});
						}
						if(bot.website != null){
						embed_fields.push({
								name: `Site web`,
								value: `[${bot.name} site](${bot.website})`,
								inline: true
							});	
						}
						embed_fields.push({
							name: kyo.I18n.translate`botinfo_get_invite`,
							value: `[Invitation](${bot.invite})`,
							inline: true
						},
						{
							name: kyo.I18n.translate`botinfo_get_owner`,
							value: `${bot.owner.map(a => "<@"+a +">")}`,
							inline: true
						});

				message.channel.createMessage({
					content: `<@${bot.id}>`,
					embed: {
						type: 'rich',
						title: bot.name,
						description: bot.shortDesc,
						url: `${config.get('webserver').location}bot/${bot.id}`,
						thumbnail: {
							url: bot.avatar
						},
						fields: embed_fields
					}
				});
			} else {
				message.channel.createMessage(kyo.I18n.translate`bot_notfound`);
			}
		}
		}
	}];
