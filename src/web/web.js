const db = require('../db');
const path = require('path');
const kyo = require('../bot.js');
const api = require('./api');
const tos = require('./tos');
const user = require('./user');
const auth = require('./auth/auth');
const authbotuser = require('./auth/index.js');
const express = require('express');
const config = require('config');
const csrf = require('./csrf');
const stats = require('./stats');
const list = require('./list');
const userlist = require('./userlist');
const botbot = require('./bot.js');
const search = require('./search.js');
const doc = require('./doc.js');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const sessionStore = require('session-rethinkdb')(session);
//init de express

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
//check si le bot et ok ou pas
const botok = (req, res, next) =>{
	if(kyo.ready){
		next();
	}else{
		res.status(500).render('error', {
			status: 500,
			message: `Le bot est en cours de demarage`
		});
	}
}
app.locals.listinvite = config.get('discord').invite;
app.locals.location = config.get('webserver').location;
app.locals.guild = config.get('discord').guild;

app.set("views", `${__dirname}/views`)
	.set('view engine', 'ejs')
	.use(session({
		secret: config.get('webserver').secret,
		resave: true,
		saveUninitialized: true,
		proxy: true,
		sessionStore
	}))
	.use(auth.initialize())
	.use(auth.session())
	.use(cookieParser())
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({
		extended: true
	}))
	.use(botok)
	.use(user.lanchsetup)
	.get('/', csrf.make, (req, res, next) => {
		res.locals.approve = true;
		next();
	}, list.list)
	.use('/list', list.router) //  Middleware
	.use('/bot', botbot) // Liste des bots
	.use('/user', userlist) //profile des user
	.use('/tos', tos)
	.use('/auth', authbotuser) // auth
	.use('/search', search.list)//recherche des bots // user à ajouter si besoin? 
	.use('/api', api)//api
	.use('/stats', stats) // page des stats repers des links 
	.use('/docs', doc) //documentation de l'api
	.get('/theme', async(req, res) =>{
		console.log(req.cookies);
		if(req.cookies){
			if(req.cookies['theme']){
				res.cookie('theme', "");
			}else{
				res.cookie('theme', 1);
			}
			res.redirect("back");
		}else{
			res.cookie('theme', 1);
			res.redirect("back");
		}
	})
	.use(express.static(path.join(__dirname, 'public')))
	.use((req, res) =>{
		let theme;
		if(req.cookies){
			theme = req.cookies[theme] == 1 ? 1 : 0;
		}else{
			theme = 0;
		}
		res.status(404).render('error', { status: 404, message: `Page non trouver`, theme});
	});

http.listen((config.get('webserver').port), function(){
	console.info('Lancer sur le port: ' + config.get('webserver').port);
});

process.on('unhandledRejection', (reason)=> {
	console.dir(reason);
});
