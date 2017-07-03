var fs_old = require('fs');
var fs = require('fs-extra');

//INITIALIZATION
var jsondb = require('node-json-db');
var scripts = require('./scripts');
db = new jsondb('jsdb/db_config', true, false);
var config;
try { config = db.getData('/svr'); }
catch (ex) { config = db.push('/svr', {}); }

//COMMAND LINE PARAMETER PARSER
var parms = process.argv.slice(2);
if (parms == 0) {
	console.log('No parameters found.');
	return;
}
switch(parms[0]) {
	case "keys":
		set_config_parm(parms.slice(1));
		break;
	case "mount":
		add_drive(parms.slice(1));
		break;
	case "scripts":
		generate_scripts(parms.slice(1));
		break;
	default:
		console.log("Invalid parameter: " + parms[0]);
		break;
}

//METHOD ENDPOINTS FOR COMMAND LINE OPERATIONS
function set_config_parm(arr) {
	if (arr.length == 0) {
		console.log("Key and Value parameters missing.");
		return;
	} else if (arr.length == 1) {
		console.log("Value parameter missing.");
		return;
	}
	config[arr[0]] = arr[1];
	db.push('/svr', config);
	console.log('Config variable "' + arr[0] + '" is now set.');
}

function add_drive(arr) {
	if (arr.length == 0) {
		console.log("Alias and Path parameters missing.");
		return;
	}
	if (config.drives == null) { config.drives = []; }
	fs.ensureDirSync(__dirname + '/dev/');
	var success = true, type, path, create;
	if (arr.length == 1) {
		type = 'sda';
		path = __dirname + '/dev/' + arr[0] + '/';
		create = function() { fs.ensureDirSync(path); }; // create path
	} else {
		type = 'sym';
		path = __dirname + '/dev/' + arr[0];
		var lnk = arr[1];
		create = function() { fs.symlinkSync(lnk, path); }; // create sym link
	}

	if (!containsKey(config.drives, 'name', arr[0])) {
		config.drives.push({
			name: arr[0],
			type: type,
			path: path
		});
		create();
	} else {
		console.log('Mounted alias "' + arr[0] + '" already exists!');
		success = false;
	}

	if (success) {
		db.push('/svr', config);
		scripts.generate('startup', config.drives);
		console.log('External drive "' + arr[0] + '" is now configured.');
		console.log('For new drives to be available, please restart device.')
	}
}

function generate_scripts(arr) {
	if (arr.length == 0) {
		console.log("Type parameter missing.");
		return;
	}
	switch(arr[0]) {
		case "startup":
			scripts.generate('startup', config.drives);
			break;
		default:
			console.log('Script type "' + arr[0] + '" not found.')
	}
}

function containsKey(arr, key, val) {
	if (arr == null || val == null || key == null) { return false; }
	return arr.filter((x) => {
		x[key] == val;
	}).length > 0;
}
