var express = require('express');
var router = express.Router();
var utils = require('../controllers/utilities');

router.get('/drives', function(req, res) {
	return utils.readServerStatusFile().then((data) => {
		res.json(data);
	}).catch((err) => {
		console.dir(err);
		res.status(500).send('Error retrieving drive status, check logs.');
	});
});

module.exports = router;
