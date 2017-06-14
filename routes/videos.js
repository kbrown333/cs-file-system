var express = require('express');
var router = express.Router();
var dbcontext = require('../jsdb/data_model').data_context;

router.get('/mp4', function(req, res) {
	var all_files = dbcontext.files.get();
	var keys = Object.keys(all_files);
	var files = [], path, parts;
	for (var i = 0; i < keys.length; i++) {
		for (var j = 0; j < all_files[keys[i]].length; j++) {
			path = all_files[keys[i]][j];
			if (path.indexOf('.mp4') == -1) { continue; }
			parts = path.split('/');
			files.push({
				path: 'media/' + path,
				name: parts[parts.length - 1]
			});
		}
	}
	res.json(files);
});

module.exports = router;
