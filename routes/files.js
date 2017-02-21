var express = require('express');
var router = express.Router();
var csfs = require("../controllers/file_system");
var dbcontext = require('../jsdb/data_model').data_context;

router.get('/', function(req, res) {
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
});

router.get('/build', function(req, res) {
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
});

router.all('/mod/*', function(req, res, next) {
	console.log('testing');
	next();
});

router.post('/mod/rename', function(req, res) {
	console.dir(req.body);
	res.json({});
});

module.exports = router;

function cache_files(data) {
	return new Promise((res, err) => {
		if (dbcontext.svr_config.get_key('cache') == 'on') {
			dbcontext.build.update(data);
			dbcontext.svr_config.set_key('files_cached', 'true');
		}
		res(data);
	});
}

function cache_build(data) {
	return new Promise((res, err) => {
		if (dbcontext.svr_config.get_key('cache') == 'on') {
			dbcontext.files.update(data);
			dbcontext.svr_config.set_key('build_cached', 'true');
		}
		res(data);
	});
}
