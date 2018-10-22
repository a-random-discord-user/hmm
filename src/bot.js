const Discord      = require('eris');
const config = require('config');
const { readdir } = require('fs');
const db = require('./db');
//init de la bdd + config (default.json) + eris
const kyo = new Discord.Client(config.get('discord').token,
	{
		defaultImageSize: 512,
        defaultImageFormat: "png"
	});
const eventHandlers = {
	ready: require('./events/ready'),
	messageCreate: require('./events/messageCreate'),
	guildMemberAdd: require('./events/guildMemberAdd'),
	userUpdate: require('./events/userUpdate'),
};
	//init de I18n avec attribution direct de kyo
	kyo.I18n = require('node-i18n');
	//init des langues :)
	kyo.languages = {};
	//require des fichiers avec FS sans aucun bug
/*	readdir('./src/helpers/', (err, files) => {
	  if (err) throw err;
	  console.log(`[Helpers] Loading ${files.length} modules...`);

	  files.forEach((f) => {
	    const helper = require(`../helpers/${f}`);
	    kyo[f.split('.')[0]] = helper;
	  });
	});*/

	readdir('./translations/', (err, files) => {
	  if (err) throw err;
	  console.log(`[translations] Loading ${files.length} translations...`);

	  files.forEach((f) => {
	    const translation = require(`../translations/${f}`);
	    kyo.languages[f.split('.')[0]] = translation;
	  });

	  kyo.I18n.init({ bundles: kyo.languages, defaultCurrency: 'EUR' });
	});

//chargement des events de base requis pour le site et le serv 
	kyo.on('ready', () => {
		eventHandlers.ready(kyo);
		module.exports.ready = true;
		let status;
		module.exports.getFirstMember = kyo.getFirstMember = usr => {
        var test = kyo.guilds.find(svr => {
            return svr.members.has(usr);
            });
        if(!test){
        	status = "N/A";
        	return status;
        }else{
        	return test.members.get(usr).status
        }
        /*.members.get(usr).status;
		kyo.getFirstMember = usr => {
		return kyo.guilds.find(svr => {
			if(svr.members.get(usr) && svr.members.get(usr).status){
				const status = svr.members.get(usr).status;
				return status;
			}else{
					const status = "test";
					return status;
				}
			})*/
           
    };		
	});

	kyo.on('messageCreate',async (msg) => {
		if(kyo.ready){ //verif si le kyo et démarer ou non
			await eventHandlers.messageCreate(kyo, msg);
		}
	});

	kyo.on('guildMemberAdd', async (svr, member, oldmemberdata) => {
		if(kyo.ready){
			await eventHandlers.guildMemberAdd(kyo, svr, member, oldmemberdata);
		}
	});

	kyo.on('userUpdate', user => {
		if(kyo.ready){
			eventHandlers.userUpdate(kyo, user);
		}
	});
	kyo.on('error', e => { console.error(e); });
	kyo.on('warn', e => { console.warn(e); });
	//et utile au debut
	kyo.on('debug', e => { console.info(e); });
	//lancement du kyo
	console.log('Connexion du kyo...');
	kyo.connect();

	// Démarage du site web
	var web = require('./web/web');
module.exports.kyo = kyo;

