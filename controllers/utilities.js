var fs = require('fs');
var path = require('path');
var dbcontext = require('../jsdb/data_model').data_context;

module.exports.readServerStatusFile = function() {
	return new Promise((res, err) => {
		serverStatusText.then(res);
	});
}

//INTERNAL FUNCTIONS
var serverStatusText = new Promise((res, err) => {
	var root = dbcontext.svr_config.get_key('media_root');
	var drives = dbcontext.svr_config.get_key('drives');
	var fpath = path.join(root, 'drive_status.txt');
	fs.readFile(fpath, 'utf8', (error, rslt) => {
		if (error) return err(error);
		var data = rslt.split('\n').filter(fltr_RemoveEmpty);
		var ts = data[0];
		data = data.slice(1);
		var offline = drives.filter((val) => {
			if (val.uuid == null) return false;
			return data.indexOf(val.uuid) != -1;
		}).map((val) => {
			return val.name;
		});
		return res({
			start_time: ts,
			offline: offline
		});
	});
});

var fltr_RemoveEmpty = function(val) { return val != "" }
