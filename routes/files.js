var express = require('express');
var router = express.Router();
var csfs = require("../controllers/file_system");
var dbcontext = require('../jsdb/data_model').data_context;

router.get('/', function(req, res) {
	return_files(res);
});

router.get('/build', function(req, res) {
	return_build(res);
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
			return_build(res);
		}
	});
});

router.all('/mod/*', function(req, res, next) {
	console.log('testing');
	next();
});

router.post('/mod/copy', function(req, res) {
	//console.dir(req.body);
	var from_drive = get_drive_by_name(req.body.from_drive);
	var to_drive = get_drive_by_name(req.body.to_drive);
	if (from_drive ==null || to_drive == null) {
		res.status(500).send('Drive(s) not found');
		return;
	}
	var from_path =  from_drive.path + (req.body.from_path == '/' ? '/' : (req.body.from_path + '/'));
	var to_path = to_drive.path + (req.body.to_path == '/' ? '/' : (req.body.to_path + '/'));
	//console.log(from_path + ': ' + to_path);
	csfs.copy_files(to_drive, from_path, to_path, req.body.contents)
		.then((rslt) => {
			var build = dbcontext.build.get_key(to_drive.name);
			csfs.build_manager.update_folder(to_drive, build, to_path, req.body.to_path)
				.then(() => {return_build(res)});
		})
		.catch((err) => {
			res.status(500).send('Error copying files, please try again.');
		});
});

module.exports = router;

//PRIVATE METHODS

function return_files(res) {
	var cache = dbcontext.svr_config.get_key('cache') == 'on';
	var cache_loaded = dbcontext.svr_config.get_key('files_cached') == 'true'
	if (cache && cache_loaded) {
		console.log('Returning files from cache');
		var build = dbcontext.files.get();
		res.json(build);
	} else {
		csfs.get_list(global.svr_config.drives)
			.then(cache_files)
			.then((rslt) => { res.json(rslt); })
			.catch((errs) => {
				console.log(errs);
				res.status(500).send('Error retreiving files.')
			});
	}
}

function return_build(res) {
	var cache = dbcontext.svr_config.get_key('cache') == 'on';
	var cache_loaded = dbcontext.svr_config.get_key('build_cached') == 'true'
	if (cache && cache_loaded) {
		console.log('Returning build from cache');
		var build = dbcontext.build.get();
		res.json(build);
	} else {
		csfs.get_object(global.svr_config.drives)
			.then(cache_build)
			.then((rslt) => { res.json(rslt); })
			.catch((errs) => {
				console.log(errs);
				res.status(500).send('Error retreiving files.')
			});
	}
}

function cache_files(data) {
	return new Promise((res, err) => {
		if (dbcontext.svr_config.get_key('cache') == 'on') {
			dbcontext.files.update(data);
			dbcontext.svr_config.set_key('files_cached', 'true');
		}
		res(data);
	});
}

function cache_build(data) {
	return new Promise((res, err) => {
		if (dbcontext.svr_config.get_key('cache') == 'on') {
			dbcontext.build.update(data);
			dbcontext.svr_config.set_key('build_cached', 'true');
		}
		res(data);
	});
}

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
