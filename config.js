var jsondb = require('node-json-db');
var scripts = require('./scripts');
db = new jsondb('jsdb/db_config', true, false);
var config;
try { config = db.getData('/svr'); }
catch (ex) { config = db.push('/svr', {}); }

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
	} else if (arr.length == 1) {
		console.log("Path parameter missing.");
		return;
	}
	if (config.drives == null) { config.drives = {}; }
	config.drives[arr[0]] = __dirname + arr[1];
	db.push('/svr', config);
	scripts.generate('startup', config.drives);
	console.log('External drive "' + arr[0] + '" is now configured.');
	console.log('For new drives to be available, please restart device.')
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
