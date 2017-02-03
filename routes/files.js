var express = require('express');
var router = express.Router();
var csfs = require("../controllers/file_system");

router.get('/', function(req, res) {
	csfs.get_files(global.svr_config.drives)
		.then((rslt) => { res.json(rslt); })
		.catch((errs) => {
			console.log(errs);
			res.status(500).send('Error retreiving files.')
		});
});

router.get('/build', function(req, res) {
	csfs.get_files(global.svr_config.drives)
		.then(csfs.build_structure)
		.then((rslt) => { res.json(rslt); })
		.catch((errs) => {
			console.log(errs);
			res.status(500).send('Error retreiving files.') 
		});
});

module.exports = router;
