module.exports.init = function() {
	var jsondb = require('node-json-db');
	global.jsdb = {};
	//FILE DATABASE
	global.jsdb.files = new jsondb('jsdb/db_files', true, false);
	try {
		global.jsdb.files.getData('/files');
	} catch (ex) {
		global.jsdb.files.push('/files', {});
	}
	try {
		global.jsdb.files.getData('/build');
	} catch (ex) {
		global.jsdb.files.push('/build', {});
	}
	//CONFIGURATION DATABASE
	global.jsdb.config = new jsondb('jsdb/db_config', true, false);
	try {
		global.svr_config = global.jsdb.config.getData('/svr');
	} catch (ex) {
		global.jsdb.config.push('/svr', {'cache': 'on'});
		global.svr_config = {'cache': 'on'};
	}
}

module.exports.data_context = {
	files: {
		get: function() {
			return get_data('files', '/files');
		},
		update: function(data) {
			apply_changes('files', '/files', data);
		}
	},
	build: {
		get: function() {
			return get_data('files', '/build');
		},
		update: function(data) {
			apply_changes('files', '/build', data);
		}
	},
	svr_config: {
		get: function() {
			return get_data('config', '/svr');
		},
		get_key: function(key) {
			var data = get_data('config', '/svr');
			if (data != null) {
				return data[key];
			} else {
				return null;
			}
		},
		set_key: function(key, obj) {
			var data = get_data('config', '/svr');
			if (data != null) {
				data[key] = obj;
				apply_changes('config', '/svr', data);
			} else {
				return null;
			}
		},
		update: function(data) {
			apply_changes('config', '/svr', data);
		}
	}
}

function get_data(obj, key) {
	if (obj == null || key == null) {
		console.log('Error saving changes: null parameters in "data_model.get_data"');
		return;
	}
	try {
		var rslt = global.jsdb[obj].getData(key);
		return rslt;
	} catch (ex) {
		console.dir(ex);
		return null;
	}
}

function apply_changes(obj, key, data) {
	if (obj == null || key == null || data == null) {
		console.log('Error saving changes: null parameters in "data_model.apply_changes"');
		return;
	}
	try {
		global.jsdb[obj].push(key, data);
	} catch (ex) {
		console.dir(ex);
	}
}
