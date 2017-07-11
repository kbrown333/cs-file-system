var fs = require('fs-extra');
var __ = require('underscore');
var path_module = require('path');

module.exports.generate = function(type, media_root, data) {
	switch(type) {
		case "startup":
			startup_scripts(data, media_root);
			break;
		default:
			console.log('Unable to generate script of type "' + type + '".');
	}
}

function startup_scripts(drives, media_root) {
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
	if (drives != null && drives.length > 0) {
		var mount_script = bash_prefix.slice(0);
		mount_script += mount_prefix.replace('{{media_root}}', media_root);
		for (var i = 0; i < drives.length; i++) {
			if (drives[i].type != "sda" || drives[i].uuid == null) continue;
			mount_script += mScript(drives[i].path, drives[i].uuid, media_root);
		}
		fs.outputFile('./scripts/startup/mount_drives.sh', mount_script, (err) => {
			if (err) { console.dir(err); }
			finished();
		});
	} else {
		finished();
	}
}

function mScript(path, uuid, media_root) {
	var safe_path = lastCharacter(path) == "/" ? path.substring(0, path.length - 1) : path;
	var tmp = mount_uuid.replace(/{{uuid}}/g, uuid).replace("{{path}}", path);
	tmp = tmp.replace("{{safe_path}}", safe_path).replace('{{media_root}}', media_root);
	return tmp;
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

var mount_prefix = `echo "$(date)" > {{media_root}}drive_status.txt `;

var mount_uuid = ` && {
mount -U {{uuid}} {{path}} ||
mount -U {{uuid}} {{safe_path}} ||
echo "{{uuid}}" >> {{media_root}}drive_status.txt
} `;
