module.exports.init = function() {
	var jsondb = require('node-json-db');
	global.jsdb = {};
	global.jsdb.files = new jsondb('jsdb/db_files', true, false);
	try { jsdb.config.getData('/files'); } catch (ex) { global.jsdb.files.push('/files', {}); }
	global.jsdb.config = new jsondb('jsdb/db_config', true, false);
	try { jsdb.config.getData('/svr'); } catch (ex) { global.jsdb.config.push('/svr', {}); }
}

module.exports.build_structure = function(file_list) {
	function create_file_path(path, current_dir) {
		var parts = path.split('/').filter((val) => {return val != "";});
		if (parts.length == 1) {
			if (current_dir['_files_'] == null) { current_dir['_files_'] = []; }
			current_dir['_files_'].push(parts[0]);
		} else {
			var dir = parts[0];
			if (current_dir[dir] == null) {
				current_dir[dir] = {'...': {}, '_files_': []}
			};
			if (parts.length == 2) {
				var periodIndex = parts[1].lastIndexOf('.');
				//if folder
				if (periodIndex == 4 || periodIndex == 5) {
					current_dir[dir][parts[1]] = {'...': {}, '_files_': []}
				} else {
					current_dir[dir]['_files_'].push(parts[1]);
				}
			} else {
				parts.shift();
				var new_path = parts.reduce(reduce_path, '');
				this.create_file_path(new_path, current_dir[dir]);
			}
		}
	}
	return new Promise((res, err) => {
		var dir = {};
		for (var i = 0; i < file_list.files.length; i++) {
			this.create_file_path(file_list.files[i], dir);
		}
		res(dir);
	});
}

function reduce_path(a, b) {return a + '/' + b;};
