var csfs = require('./file_system');
var dbcontext = require('../jsdb/data_model').data_context;
var __ = require('underscore');
var path = require('path');
var id3_reader = require('jsmediatags');

module.exports.map = function(callback) {
	csfs.get_list(global.svr_config.drives).then((content) => {
		var music_db = dbcontext.music.songs;
		var root = dbcontext.svr_config.get_key('media_root');
		var queue = getFileList(content, music_db, root);
		readNewFiles(queue.new, {}, function(rslt) {
			for (var i = 0; i < queue.exists.length; i++) {
				rslt[queue.exists[i].path] = queue.exists[i].data;
			}
			dbcontext.music.songs.update(rslt);
			if (callback != null) { callback(rslt); }
		});
	});
}

function getFileList(content, db, root) {
	var keys = Object.keys(content);
	var files = [], exists = [], path;
	for (var i = 0; i < keys.length; i++) {
		for (var j = 0; j < content[keys[i]].length; j++) {
			path = content[keys[i]][j];
			if (path.indexOf('.mp3') == -1) { continue; }
			if (db[path] == null) {
				files.push({path: path, full_path: root + path});
			} else {
				exists.push({
					data: db[path],
					path: path
				});
			}
		}
	}
	return {new: files, exists: exists};
}

function readNewFiles(files, output, callback) {
	if (output == null) { output = {}};
	if (files == null || files.length == 0) {
		return callback(output);
	}
	var file = files.shift();
	readFileData(file.full_path, file.path, function(err, rslt) {
		if (!err) {
			output[rslt.path] = rslt;
		}
		readNewFiles(files, output, callback);
	});
}

function readFileData(path, out_path, callback) {
	id3_reader.read(path, {
		onSuccess: function(rslt) {
			var info = rslt.tags;
			return callback(null, {
				path: out_path,
				title: info.title,
				artist: info.artist,
				album: info.album,
				year: info.year,
				track: info.track,
				genre: info.genre
			});
		},
		onError: function(err) {
			return callback(true);
		}
	});
}
