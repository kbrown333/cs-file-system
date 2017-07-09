var fs_old = require('fs');
var fs = require('fs-extra');
var args = require('yargs').argv;
var path_module = require('path');
var scripts = require('./scripts');

//INITIALIZE DATABASE
require('./jsdb/data_model').init();
var db_context = require('./jsdb/data_model').data_context;

if (args.cmd == null) {
	console.warn('Configuration command not provded ("cmd=[command-name]")');
	return;
}

var err_msg;
switch (args.cmd) {
	case 'keys':
		if (args.key == null) err_msg = '"key" argument must be provided for command "keys"';
		else if (args.value == null) err_msg = '"value" argument must be provided for command "keys"';
		break;
	case 'mount':
		if (args.alias == null) err_msg = '"alias" argument must be provided for command "mount"';
		else if (args.type == null) err_msg = '"type" argument must be provided for command "mount"';
		else {
			if (args.type == "sym") {
				if (args.path == null) err_msg = '"path" argument must be provided for command "mount" (type "sym")';
			} else if (args.type == "hd") {
				if (args.uuid == null) err_msg = '"uuid" argument must be provided form command "mount" (type "hd")';
			} else {
				err_msg = 'invalid "type" value for command "mount"';
			}
		}
		break;
	case 'scripts':
		if (args.type == null) err_msg = '"type" argument must be provided for command "scripts"';
		break;
	default:
		err_msg = 'unknown "cmd" type';
		break;
}

if (err_msg != null) {
	console.warn(err_msg);
	return;
}

switch (args.cmd) {
	case "keys":
		set_config_parm(args.key, args.value); return;
		break;
	case "mount":
		add_drive(args.type, args.alias, args.path, args.uuid); return;
		break;
	case "scripts":
		generate_scripts(args.type); return;
		break;
	default:
		console.warn('Invalid "cmd" command'); return;
		break;
}

//METHOD ENDPOINTS FOR COMMAND LINE OPERATIONS
function set_config_parm(key, value) {
	db_context.svr_config.set_key(key, value);
	console.log('Config variable "' + key + '" is now set.');
	return;
}

function add_drive(type, alias, path, uuid) {
	var media_root = db_context.svr_config.get_key('media_root');
	fs.ensureDirSync(media_root);

	var success = true, fPath, create;
	if (media_root == null) {
		console.log('"media_root" key is null or invalid. Check your configuration file');
	}
	if (type == "hd") {
		fPath = path_module.join(media_root, alias) + '/';
		create = function() { fs.ensureDirSync(path_module.join(media_root, alias)); }; // create path
	} else {
		fPath = path_module.join(media_root, alias) + '/';
		create = function() { fs.symlinkSync(path_module.join(path), path_module.join(media_root, alias)); }; // create sym link
	}

	var svr_config = db_context.svr_config.get();
	if (!containsKey(svr_config.drives, 'name', alias)) {
		var upd_data = {
			name: alias,
			type: type == "hd" ? "sda" : type,
			path: fPath
		}
		if (type == "hd" && uuid != null) {
			upd_data['uuid'] = uuid;
		}
		svr_config.drives.push(upd_data);
		//FORCE RE-INDEX ON NEXT LOAD
		svr_config['files_cached'] = "false";
		svr_config['build_cached'] = "false";
		create();
	} else {
		console.log('Mounted alias "' + alias + '" already exists!');
		success = false;
	}

	if (success) {
		db_context.svr_config.update(svr_config);
		scripts.generate('startup', svr_config.drives);
		console.log('External drive "' + alias + '" is now configured.');
		console.log('For new drives to be available, please restart device.')
	}
}

function generate_scripts(type) {
	switch(type) {
		case "startup":
			scripts.generate('startup', db_context.svr_config.get_key('drives'));
			break;
		default:
			console.log('Script type "' + type + '" not found.')
	}
}

//UTILITY FUNCTIONS
function containsKey(arr, key, val) {
	if (arr == null || val == null || key == null) { return false; }
	return arr.filter((x) => {
		return x[key] == val;
	}).length > 0;
}
