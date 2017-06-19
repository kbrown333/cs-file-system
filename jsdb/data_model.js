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
	//MUSIC DATABASE
	global.jsdb.music = new jsondb('jsdb/db_music', true, false);
	try {
		global.jsdb.music.getData('/songs');
	} catch (ex) {
		global.jsdb.music.push('/songs', {});
	}
	try {
		global.jsdb.music.getData('/playlists');
	} catch (ex) {
		global.jsdb.music.push('/playlists', []);
	}
	//VIDEO DATABASE
	global.jsdb.videos = new jsondb('jsdb/db_videos', true, false);
	try {
		global.jsdb.videos.getData('/groups');
	} catch (ex) {
		global.jsdb.videos.push('/groups', []);
	}
	//CONFIGURATION DATABASE
	global.jsdb.config = new jsondb('jsdb/db_config', true, false);
	try {
		global.svr_config = global.jsdb.config.getData('/svr');
	} catch (ex) {
		var def = {
			'drives': [],
			'cache': 'on',
			'media_root': require('path').join(__dirname, '..', 'dev') + '/',
			'build_cached': 'false',
			'files_cached': 'false'
		}
		global.jsdb.config.push('/svr', def);
		global.svr_config = def;
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
		get_key: function(key) {
			var data = get_data('files', '/build');
			if (data != null) {
				return data[key];
			} else {
				return null;
			}
		},
		set_key: function(key, obj) {
			var data = get_data('files', '/build');
			if (data != null) {
				data[key] = obj;
				apply_changes('files', '/build', data);
			} else {
				return null;
			}
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
	},
	music: {
		songs: {
			get: function() {
				return get_data('music', '/songs');
			},
			get_key: function(key) {
				var data = get_data('music', '/songs');
				if (data != null) {
					return data[key];
				} else {
					return null;
				}
			},
			set_key: function(key, obj) {
				var data = get_data('music', '/songs');
				if (data != null) {
					data[key] = obj;
					apply_changes('music', '/songs', data);
				} else {
					return null;
				}
			},
			update: function(data) {
				apply_changes('music', '/songs', data);
			}
		},
		playlists: {
			get: function() {
				return get_data('music', '/playlists');
			},
			get_key: function(key) {
				var data = get_data('music', '/playlists');
				if (data != null) {
					return data[key];
				} else {
					return null;
				}
			},
			set_key: function(key, obj) {
				var data = get_data('music', '/playlists');
				if (data != null) {
					data[key] = obj;
					apply_changes('music', '/playlists', data);
				} else {
					return null;
				}
			},
			update: function(data) {
				apply_changes('music', '/playlists', data);
			}
		}
	},
	videos: {
		groups: {
			get: function() {
				return get_data('videos', '/groups');
			},
			get_key: function(key) {
				var data = get_data('videos', '/groups');
				if (data != null) {
					return data[key];
				} else {
					return null;
				}
			},
			set_key: function(key, obj) {
				var data = get_data('videos', '/groups');
				if (data != null) {
					data[key] = obj;
					apply_changes('videos', '/groups', data);
				} else {
					return null;
				}
			},
			update: function(data) {
				apply_changes('videos', '/groups', data);
			}
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
