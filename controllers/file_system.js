var express = require('express');
var ls = require('cs-file-tree');
var fs_old = require('fs');
var fs = require('fs-extra');
var exp_path = require('path');
var __ = require('underscore');
var formidable = require('formidable');
var dbcontext = require('../jsdb/data_model').data_context;
var _extend = require('extend');

module.exports.get_list = function(drives) {
	return new Promise((res, error) => {
		if (drives == null) {
			error("No drives found.");
		} else {
			var files = {}, errs = [];
			if (drives.length == 0) { error("No drives found."); }
			var finished = __.after(drives.length, function() {
				if (errs.length > 0) {
					error('Error retrieving files.');
				} else {
					res(files);
				}
			});
			var add = function(err, tree, key) {
				if (err) {
					errs.push(err);
					finished();
				} else {
					files[key] = [];
					tree.forEach(function(file, index) {
						files[key].push(file);
					});
					finished();
				}
			}
			for (var i = 0; i < drives.length; i++) {
				(function(index) {
					var key = drives[index].name;
					ls.getList(drives[index].path, (err, tree) => { add(err, tree, key); });
				})(i);
			}
		}
	});
}

module.exports.get_object = function(drives) {
	return new Promise((res, error) => {
		if (drives == null) {
			error("No drives found.");
		} else {
			var rslt = {};
			var finished = __.after(drives.length, function() {
				res(rslt);
			});
			for (var i = 0; i < drives.length; i++) {
				(function(index) {
					var key = drives[index].name;
					ls.getObject(drives[index].path, (err, tree) => {
						if (err) {
							console.dir(err);
						}
						rslt[key] = tree;
						finished();
					});
				})(i);
			}
		}
	});
}

module.exports.upload_files = function(form_data, dir, callback) {
	var form = new formidable.IncomingForm();
	form.multiples = true;
	form.uploadDir = dir;
	var errs = [];
	var new_files = [];

	form.on('file', function(field, file) {
		fs_old.rename(file.path, exp_path.join(form.uploadDir, file.name));
		new_files.push(file.name);
	});

	form.on('error', function(err) {
		console.log('An error has occured: \n' + err);
		errs.push(err);
	});

	form.on('end', function() {
		if (errs.length > 0) {
			callback(errs);
		} else {
			callback(null, new_files);
		}
	});

	form.parse(form_data);
}

module.exports.copy_files = function(to_drive, from_dir, to_dir, obj) {
	console.log(obj);
	return new Promise((res, error) => {
		var data;
		try {
			data = JSON.parse(obj);
		} catch(ex) {
			error(ex);
		}
		if (data.length == null) {
			error('Objects array is empty'); return;
		}
		var finished = __.after(data.length, function() {
			res();
		})
		for (var i = 0; i < data.length; i++) {
			fs.copy(from_dir + data[i].name, to_dir + data[i].name, (err) => {
				if (err) { console.dir(err); }
				finished();
			});
		}
	});
}

module.exports.build_manager = {
	insert: function(drive, obj, path, files, folders) {
		try {
			var cache = dbcontext.svr_config.get_key('cache') == 'on';
			var cache_loaded = dbcontext.svr_config.get_key('build_cached') == 'true'
			if (cache && cache_loaded) {
				add_files_to_dir(obj, path, files, folders);
				dbcontext.build.set_key(drive, obj);
			}
		} catch(ex) {
			console.dir(ex);
		}
	},
	update_folder: function(drive, build, start, path) {
		console.log('testing123')
		return new Promise((res, error) => {
			try {
				var cache = dbcontext.svr_config.get_key('cache') == 'on';
				var cache_loaded = dbcontext.svr_config.get_key('build_cached') == 'true'
				if (cache && cache_loaded) {
					ls.getObject(start, function(err, tree) {
						if (err) { error(tree); return; }
						update_specific_directory(build, path, tree);
						dbcontext.build.set_key(drive.name, build);
						res();
					});
				}
			} catch(ex) {
				console.dir(ex);
			}
		});
	}
}

function reduce_path(a, b) {return a + '/' + b;};

function add_files_to_dir(obj, path, files, folders) {
	var dir = get_specific_directory(obj, path);
	dir['_files_'] = dir['_files_'].concat(files);
}

function update_specific_directory(obj, path, content) {
	var dir = get_specific_directory(obj, path);
	dir['_files_'] = content['_files_'];
	Object.keys(content).forEach(function(k) {
		dir[k] = content[k];
	});
}

function get_specific_directory(obj, path) {
	var tmp = path.split('/').filter((val) => {return val != "";});
	var dir = obj, path;
	for (var i = 0; i < tmp.length; i++) {
		path = tmp[i];
		dir = dir[path];
	}
	return dir;
}
