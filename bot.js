const config = require('config');
const defaultConfig = config.get('rethinkdb');
const rConfig = { servers: defaultConfig.servers };
const db = require('rethinkdbdash')(rConfig);

const verifyDb = async () => {
	const shouldConfigure = !(await db.dbList().contains('kyo').run());
	if (shouldConfigure) {
		await db.dbCreate(defaultConfig.db);
		['bots', 'csrf', 'users', 'session', 'i18n', 'user', 'votes'].map(async (table) => {
			await db.db(defaultConfig.db).tableCreate(table).run();
		});
	}

	db.getPoolMaster().drain();
};

verifyDb();
require('./src/bot');
