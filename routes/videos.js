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

router.get('/groups', function(req, res) {
	res.json(dbcontext.videos.groups.get());
});

router.post('/groups', function(req, res) {
	var name = req.body.new_group;
	var groups = dbcontext.videos.groups.get();
	var exists = groups.filter((val) => {
		return val.name == name;
	});
	if (exists.length == 0) {
		groups.push({name: name, filter_groups: []});
		dbcontext.videos.groups.update(groups);
		res.send('success');
	} else {
		res.status(500).send('Group already exists');
	}
});

router.post('/groups/insert', function(req, res) {
	if (req.body.group == null || req.body.query == null) {
		console.log('Missing required parameter');
		return res.status(500).send('Missing required parameter');
	}
	var groups = dbcontext.videos.groups.get();
	var match_groups = groups.filter((val) => { return val.name == req.body.group });
	if (match_groups.length == 0) {
		console.log('Invalid group');
		return res.status(500).send('Invalid group');
	}
	var group = match_groups[0];
	var exists = group.filter_groups.filter((val) => { return val == req.body.query }).length > 0;
	if (exists) {
		console.log('Query already exists in this group');
		return res.status(500).send('Query already exists in this group');
	}
	group.filter_groups.push(req.body.query);
	dbcontext.videos.groups.update(groups);
	res.json(group);
});

router.post('/groups/remove', function(req, res) {
	var queries = JSON.parse(req.body.queries);
	if (req.body.group == null || queries == null) {
		console.log('Missing required parameter');
		return res.status(500).send('Missing required parameter');
	}
	var groups = dbcontext.videos.groups.get();
	var match_groups = groups.filter((val) => { return val.name == req.body.group });
	if (match_groups.length == 0) {
		console.log('Invalid group');
		return res.status(500).send('Invalid group');
	}
	var group = match_groups[0];
	var map = {};
	for (var i = 0; i < queries.length; i++) {
		map[queries[i]] = true;
	}
	group.filter_groups = group.filter_groups.filter((val) => {
		return !map[val];
	});
	dbcontext.videos.groups.update(groups);
	res.json(group);
});

router.post('/groups/delete', function(req, res) {
	var del_groups = JSON.parse(req.body.groups);
	if (del_groups == null) {
		console.log('Missing required parameter');
		return res.status(500).send('Missing required parameter');
	}
	var groups = dbcontext.videos.groups.get();
	var upd_groups = groups.filter((val) => {
		return !del_groups[val.name];
	});
	dbcontext.videos.groups.update(upd_groups);
	res.json(upd_groups);
});

module.exports = router;
