module.exports.init = function() {
	var jsondb = require('node-json-db');
	global.jsdb = {};
	global.jsdb.files = new jsondb('jsdb/db_files', true, false);
	global.jsdb.config = new jsondb('jsdb/db_config', true, false);
	try {
	    global.svr_config = jsdb.config.getData('/svr');
	} catch (ex) {
	    global.jsdb.config.push('/svr', {});
	    global.svr_config = {};
	}
}
