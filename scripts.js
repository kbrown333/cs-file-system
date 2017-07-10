var fs = require('fs-extra');
var __ = require('underscore');
var path_module = require('path');

module.exports.generate = function(type, data) {
	switch(type) {
		case "startup":
			startup_scripts(data);
			break;
		default:
			console.log('Unable to generate script of type "' + type + '".');
	}
}

function startup_scripts(drives) {
	var path = __dirname;
	//INITIALIZATION SCRIPT
	var init_script = init_cpk.replace('{{path}}', path);
	var finished = __.after(2, () => {
		console.log('Startup scripts generated.');
	});
	fs.outputFile('./scripts/startup/cpk_init.sh', init_script, (err) => {
		if (err) { console.dir(err); }
		finished();
	});
	//MOUNT DRIVE(S) SCRIPT
	if (drives != null) {
		var mount_script = bash_prefix.slice(0);
		if (drives.length > 0) {
			for (var i = 0; i < drives.length; i++) {
				if (drives[i].type == "sda" && drives[i].uuid != null) {
					mount_script += mScript(i, drives[i].path, drives[i].uuid);
					mount_script += '\r\n';
				}
			}
			fs.outputFile('./scripts/startup/mount_drives.sh', mount_script, (err) => {
				if (err) { console.dir(err); }
				finished();
			});
		} else {
			finished();
		}
	} else {
		finished();
	}
}

function mScript(i, path, uuid) {
	var safe_path = lastCharacter(path) == "/" ? path.substring(0, path.length - 1) : path;
	return mount_uuid.replace(/{{uuid}}/g, uuid).replace("{{path}}", path).replace("{{safe_path}}", safe_path);
}

function lastCharacter(str) {
	return str.slice(-1);
}

//HARD-CODED TEMPLATE STRINGS
var bash_prefix =
`#!/bin/sh

`;

var init_cpk =
`#!/bin/sh

export NODE_ENV=development
export PATH=/usr/local/bin:$PATH

cd {{path}}
node index.js >> output-log.txt`;

var mount_uuid =
`mount -U {{uuid}} {{path}} ||
mount -U {{uuid}} {{safe_path}}`;
