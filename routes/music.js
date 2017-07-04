var express = require('express');
var router = express.Router();
var dbcontext = require('../jsdb/data_model').data_context;
var mapper = require('../controllers/song_map');

router.get('/songs', function(req, res) {
	res.json(dbcontext.music.songs.get());
});

router.get('/map', function(req, res) {
	var nocache = req.query.nocache ? true : false;
	mapper.map(function(rslt) {
		res.json(rslt);
	}, nocache);
});

router.get('/playlists', function(req, res) {
	res.json(dbcontext.music.playlists.get());
});

router.post('/playlists', function(req, res) {
	var name = req.body.playlist;
	var playlists = dbcontext.music.playlists.get();
	var exists = playlists.filter((val) => {
		return val.name == name;
	});
	if (exists.length == 0) {
		playlists.push({name: name, tracks: []});
		dbcontext.music.playlists.update(playlists);
		res.send('success');
	} else {
		res.status(500).send('Playlist already exists');
	}
});

router.post('/playlists/insert', function(req, res) {
	var parms = JSON.parse(req.body.info);
	console.log(parms);
	if (parms.name == null || parms.songs == null) {
		return res.status(500).send('Required parameter is missing.');
	}
	var name = parms.name;
	var songs = parms.songs;
	var playlists = dbcontext.music.playlists.get();
	var exists = playlists.filter((val) => {
		return val.name == name;
	});
	if (exists.length == 0) { return res.status(500).send("Playlist doesn't exist"); }
	var list = exists[0];
	var map = list.tracks.map((val) => {
		return val.path;
	});
	for (var i = 0; i < songs.length; i++) {
		if (map.indexOf(songs[i].path) == -1) {
			list.tracks.push(songs[i]);
		}
	}
	dbcontext.music.playlists.update(playlists);
	res.json(list);
});

router.post('/playlists/remove', function(req, res) {
	var parms = JSON.parse(req.body.info);
	if (parms.map == null || parms.name == null) {
		return res.status(500).send('Required parameter is missing.');
	}
	var map = parms.map;
	var name = parms.name;
	var playlists = dbcontext.music.playlists.get();
	var index = -1;
	var exists = playlists.filter((val, i) => {
		if (val.name == name && index == -1) {
			index = i;
			return true;
		}
	});
	if (exists.length == 0) { return res.json([]); }
	var list = exists[0];
	playlists[index].tracks = list.tracks.filter((val) => {
		return map[val.path] == null;
	});
	dbcontext.music.playlists.update(playlists);
	res.json(playlists[index]);
});

router.post('/playlists/delete', function(req, res) {
	var parms = JSON.parse(req.body.info);
	if (parms.map == null) {
		return res.status(500).send('Required parameter is missing.');
	}
	var map = parms.map;
	var playlists = dbcontext.music.playlists.get();
	playlists = playlists.filter((val) => {
		return map[val.name] == null;
	});
	dbcontext.music.playlists.update(playlists);
	res.json(playlists);
});

module.exports = router;
