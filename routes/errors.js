var express = require('express');
var router = express.Router();

router.post('/write', function(req, res) {
	if (req.body.msg == null) { return res.status(500).send('No message in error report')}
	global.error_log.log('Unhandled Client Error', req.body);
	res.send('Success');
});

module.exports = router;
