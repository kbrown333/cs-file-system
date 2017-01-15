var express = require('express');
var ls = require('list-directory-contents');
var __ = require('underscore');

module.exports.get_files = function(drives) {
	return new Promise((res, error) => {
		if (drives == null) {
			error("No drives found.");
		} else {
			var files = [], errs = [];
			var keys = Object.keys(drives);
			if (keys.length == 0) { error("No drives found."); }
			var finished = __.after(keys.length, function() {
				if (errs.length > 0) {
					error('Error retrieving files.');
				} else {
					res({ files: files });
				}
			});
			var add = function(err, tree) {
				if (err) {
					errs.push(err);
					finished();
				} else {
					tree.forEach(function(file, index) {
						files.push(file.replace(/\\/g, '/'));
					});
					finished();
				}
			}
			for (var i = 0; i < keys.length; i++) {
				console.log('getting drive "' + keys[i] + '"');
				ls(drives[keys[i]] + '/', add);
			}
		}
	});
}
