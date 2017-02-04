var express = require('express');
var ls = require('cs-file-tree');
var __ = require('underscore');

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
						files[key].push(file.replace(/\\/g, '/'));
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

function reduce_path(a, b) {return a + '/' + b;};
