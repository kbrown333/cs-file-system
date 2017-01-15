var express = require('express');
var ls = require('list-directory-contents');
var __ = require('underscore');

module.exports.get_files = function(drives) {
	return new Promise((res, error) => {
		if (drives == null) {
			error("No drives found.");
		} else {
			var files = {}, errs = [];
			var keys = Object.keys(drives);
			if (keys.length == 0) { error("No drives found."); }
			var finished = __.after(keys.length, function() {
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
						files[key].push(file.replace(/\\/g, '/'));
					});
					finished();
				}
			}
			for (var i = 0; i < keys.length; i++) {
				(function(index) {
					var key = keys[index];
					console.log('getting drive "' + key + '"');
					ls(drives[key] + '/', (err, tree) => { add(err, tree, key); });
				})(i);
			}
		}
	});
}

module.exports.build_structure = function(drives) {
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
		var dirs = {}, keys = Object.keys(drives), key;
		for (var i = 0; i < keys.length; i++) {
			key = keys[i];
			dirs[key] = {};
			for (var j = 0; j < drives[key].length; j++) {
				this.create_file_path(drives[key][j], dirs[key]);
			}
		}
		res(dirs);
	});
}

function reduce_path(a, b) {return a + '/' + b;};
