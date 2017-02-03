module.exports.init = function() {
	var jsondb = require('node-json-db');
	global.jsdb = {};
	//FILE DATABASE
	global.jsdb.files = new jsondb('jsdb/db_files', true, false);
	try {
		global.jsdb.config.getData('/files');
	} catch (ex) {
		global.jsdb.files.push('/files', {});
	}
	//CONFIGURATION DATABASE
	global.jsdb.config = new jsondb('jsdb/db_config', true, false);
	try {
		global.svr_config = global.jsdb.config.getData('/svr');
	} catch (ex) {
		global.jsdb.config.push('/svr', {});
		global.svr_config = {};
	}
}
