var express = require('express');
var router = express.Router();
var csfs = require("../controllers/file_system");
var dbcontext = require('../jsdb/data_model').data_context;
var npm_path = require('path');

router.get('/', function(req, res) {
	csfs.get_list(function(err, rslt) {
		if (err) {
			res.status(500).send(err);
		} else {
			res.json(rslt);
		}
	});
});

router.get('/build', function(req, res) {
	csfs.get_object(function(err, rslt) {
		if (err) {
			res.status(500).send(err);
		} else {
			res.json(rslt);
		}
	});
});

router.get('/index', function(req, res) {
	csfs.get_list(function(err, rslt) {
		if (err) { return res.status(500).send(err); }
		csfs.get_object(function(err2, rslt2) {
			if (err2) {
				res.status(500).send(err2);
			} else {
				res.json(rslt2);
			}
		}, true);
	}, true);
});

router.post('/upload', function(req, res) {
	var add_path = req.headers['x-path'];
	var drive_name = req.headers['x-drive'];
	if (add_path == null || drive_name == null) {
		res.status(500).send('Missing path / drive parameter(s)');
		return;
	}
	var drive = get_drive_by_name(drive_name);
	if (drive == null) {
		res.status(500).send('Invalid drive name');
		return;
	}
	var path = drive.path + add_path + (add_path == '/' ? '' : '/');
	csfs.upload_files(req, path, function(err, rslt) {
		if (err) {
			console.dir(err);
			res.status(500).send('Error uploading files');
		} else {
			var build = dbcontext.build.get_key(drive.name);
			csfs.build_manager.insert(drive.name, build, add_path, rslt);
			csfs.get_object(function(err2, rslt2) {
				if (err) {
					res.status(500).send(err2);
				} else {
					res.json(rslt2);
				}
			});
		}
	});
});

router.get('/download', function(req, res) {
	try {
		var drive = get_drive_by_name(req.query.drive);
		var fname = req.query.file;
		if (drive == null) {
			res.status(500).send('Drive not found');
			return;
		}
		if (fname == null) {
			res.status(500).send('File not found');
			return;
		}
		var file = drive.path + fname;
		console.log(file);
		res.download(file);
	} catch (ex) {
		console.log(ex);
		res.status(500).send('Error downloading file');
	}
});

router.all('/mod/*', function(req, res, next) {
	console.log('testing');
	next();
});

router.post('/mod/copy', function(req, res) {
	var from_drive = get_drive_by_name(req.body.from_drive);
	var to_drive = get_drive_by_name(req.body.to_drive);
	if (from_drive ==null || to_drive == null) {
		res.status(500).send('Drive(s) not found');
		return;
	}
	var from_path = generateFilPath(from_drive.path, req.body.from_path);
	var to_path = generateFilPath(to_drive.path, req.body.to_path);
	csfs.copy_files(to_drive, from_path, to_path, req.body.contents)
		.then((rslt) => {
			var build = dbcontext.build.get_key(to_drive.name);
			csfs.build_manager.update_folder(to_drive, build, to_path, req.body.to_path)
				.then(() => {
					csfs.get_object(function(err, rslt2) {
						if (err) {
							res.status(500).send(err);
						} else {
							res.json(rslt2);
						}
					});
				})
				.catch((err) => { console.dir(err); res.status(500).send('Error copying file, check logs.'); });
		})
		.catch((err) => {
			res.status(500).send('Error copying files, please try again.');
		});
});

router.post('/mod/delete', function(req, res) {
	var from_drive = get_drive_by_name(req.body.from_drive);
	if (from_drive ==null) {
		res.status(500).send('Drive not found');
		return;
	}
	var from_path = generateFilPath(from_drive.path, req.body.from_path);
	csfs.delete_files(from_path, req.body.contents)
		.then((rslt) => {
			var build = dbcontext.build.get_key(from_drive.name);
			csfs.build_manager.update_folder(from_drive, build, from_path, req.body.from_path)
				.then(() => {
					csfs.get_object(function(err, rslt2) {
						if (err) {
							res.status(500).send(err);
						} else {
							res.json(rslt2);
						}
					});
				})
				.catch((err) => { console.dir(err); res.status(500).send('Error deleting file, check logs.'); });
		})
		.catch((err) => {
			res.status(500).send('Error deleting files, please try again.');
		});
});

router.post('/mod/new_folder', function(req, res) {
	var from_drive = get_drive_by_name(req.body.from_drive);
	if (from_drive ==null) {
		res.status(500).send('Drive not found');
		return;
	}
	if (req.body.folder_name == null) {
		res.status(500).send('Invalid folder name');
		return;
	}
	var from_path = generateFilPath(from_drive.path, req.body.from_path);
	csfs.create_folder(from_path + req.body.folder_name)
		.then(() => {
			var build = dbcontext.build.get_key(from_drive.name);
			csfs.build_manager.insert_folder(from_drive, build, req.body.from_path, req.body.folder_name)
				.then(() => {
					csfs.get_object(function(err, rslt2) {
						if (err) {
							res.status(500).send(err);
						} else {
							res.json(rslt2);
						}
					});
				})
				.catch((err) => { console.dir(err); res.status(500).send('Error creating folder, check logs.'); });
		})
		.catch((err) => {
			res.status(500).send('Error adding new folder, please try again.');
		});
});

router.post('/mod/rename', function(req, res) {
	var from_drive = get_drive_by_name(req.body.from_drive);
	if (from_drive ==null) {
		res.status(500).send('Drive not found');
		return;
	}
	if (req.body.old_name == null || req.body.new_name == null) {
		res.status(500).send('Invalid file path(s), a restart may resolve this issue.');
		return;
	}
	var from_path = generateFilPath(from_drive.path, req.body.from_path);
	csfs.rename_file(from_path + req.body.old_name, from_path + req.body.new_name)
		.then(() => {
			var build = dbcontext.build.get_key(from_drive.name);
			csfs.build_manager.rename_file(from_drive, build, req.body.from_path, req.body.old_name, req.body.new_name)
				.then(() => {
					csfs.get_object(function(err, rslt2) {
						if (err) {
							res.status(500).send(err);
						} else {
							res.json(rslt2);
						}
					});
				})
				.catch((err) => { console.dir(err); res.status(500).send('Error renaming file, check logs.'); });
		})
		.catch((err) => {
			res.status(500).send('Error adding new folder, please try again.');
		});
});

module.exports = router;

//PRIVATE METHODS
function get_drive_by_name(drive_name) {
	var drives = dbcontext.svr_config.get_key('drives');
	if (drives == null) { return null; }
	var drive = drives.filter((val) => {return val.name == drive_name});
	if (drive.length > 0) {
		return drive[0];
	} else {
		return null;
	}
}

function generateFilPath(drive, path) {
	if (path == '/') { return drive + '/'; }
	return npm_path.join(drive, path) + '/';
}
