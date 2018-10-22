const config = require('config');
const db = require('rethinkdbdash')(config.get('rethinkdb'));
module.exports = db;
