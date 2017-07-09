var fs = require('fs-extra');
var __ = require('underscore');

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
					mount_script += mount_uuid.replace("{{index}}", i+1)
						.replace("{{uuid}}", drives[i].uuid).replace("{{path}}", drives[i].path);
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

var mount = 'mount /dev/sda{{index}} {{path}}';
var mount_uuid = 'mount -U {{uuid}} {{path}}';
