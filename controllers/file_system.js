var express = require('express');
var ls = require('cs-file-tree');
var fs_old = require('fs');
var exp_path = require('path');
var __ = require('underscore');
var formidable = require('formidable');
var dbcontext = require('../jsdb/data_model').data_context;

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

module.exports.build_manager = {
	insert: function() {
		
	}
}

function reduce_path(a, b) {return a + '/' + b;};
