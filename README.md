# IoT Shaman - Raspberry Pi File System / Media Server

Turn your existing external hard-drives into a wireless file-system / media server! All you need is a Raspberry Pi (or any other linux box) and some form of storage device (flash drive, external hard drive, etc). Use the file system to add / delete / copy / paste files. Copy files from 1 hard drive to another! Use the media server to listen to your local music files and watch your local video files. Music and Video players contain all sorts of features, including video / music shuffle, searching across multiple drives, mp3 Tag reader, and more! This project is officially suported by <a href="https://www.iotshaman.com">IoT Shaman</a>.

## Project Structure
The structure of this project is broken into two groups: ``client`` and ``server``.
The client folder contains the user-interface markup / logic, and is built on top of Typescript and Aurelia.
The root folder contains the server logic, responsible for serving the files and processing requests from the client-side application.

## Requirements
Before building this project you will need to following resources:

- Raspberry Pi (or other linux device)
- media storage device
- npm
- jspm
- typings

NOTE: JSPM and Typings can both be installed using npm.

## Installation
First, open the project's root folder in a terminal and type ``npm install``

Next, open the ``client`` folder in the project root and enter the following commands:

- npm install
- jspm install -y
- typing install

## Configuration

### Configuring Hard Drives
You will need to do some minor command-line configuration to setup your hard drive(s). Before you go any further, take a look at our help output by opening a terminal in the project root folder and typing ``npm run help``. You should see some output that describes how to interact with our configuration CLI. Below is a copy of the output:

```
FORMAT: node config.js --cmd command-name [command arguments]
EXAMPLE: node config.js --cmd keys --key cache --value off

COMMAND ("--cmd") ARGUMENT VALUES:
[1]: keys: sets the value of a config variable
[2]: mount: register external storage device
[3]: link: generate / register symlink
[4]: scripts: generate system scripts

ARGUMENTS FOR AVILABLE COMMANDS:
command-name: "keys"
[1]: --key [name of json key]
[2]: --value [value to store]
command-name: "mount"
[1]: --alias [display name]
[2]: --uuid [uuid of storage device]
command-name: "link"
[1]: --alias [display name]
[2]: --path [absolute path of folder]
command-name: "scripts"
[1]: --type [script group to generate]
[!] NOTE: ONLY AVAILABLE VALUE IS "startup" (for now)
```

The most important command to note is the "mount" command, which will create a database entry for your external hard drives. Before continuing, please make sure to plugin at least 1 extneral hard drive into your linux machine.

To set your hard drive up with the system, you first need to find the uuid of your external hard drive. The easiest way I have found to locate the uuid is to enter the following command into a terminal:

``sudo blkid /dev/sd*``

This will print out a list of all attached storage devices providing the device name, uuid, as well as other info. Look  through the list and find the uuid matching your device's name ("LABEL" value). Using this value, open a terminal in the project's root folder and enter the following command (replacing values in braces with actual values):

``node config.js --cmd mount --alias [display name] --uuid [uuid]``

You can also have the server load a directory (recursively) on your linux machine. To accomplish this, enter the following command (replacing 'my-folder' with an alias and /home/pi/Videos with the folder path you want to mount):

``node config.js --cmd link --alias my-folder --path /home/pi/Videos``

IMPORTANT NOTE: do not inlcude spaces in your mount aliases, this could potentially cause problems with the server.

### Generating Startup Scripts
If you want your Raspberry Pi or other linux machine to start the server and mount the hard drive(s) when booting up, then you will want to perform a few additional steps. Open a terminal in the project's root folder and enter the following commands:

```
node config.js --cmd scripts --type startup
cd scripts/startup
sudo chmod 755 ./cpk_init.sh
sudo chmod 755 ./mount_drives.sh
```

The first command will generate the necessary startup scripts and place them in the ``scripts/startup`` folder. The following commands will give these scripts permissions so they can be executed. Once this is complete, we want to set these up to run whenever the device is started. In your terminal, open the file ``/etc/rc.local`` in a text editor and add the following lines of code at the end (replacing the path with your servers local path):

```
/home/user/path/to/app/cs-file-system/scripts/startup/cpk_init.sh &
/home/user/path/to/app/cs-file-system/scripts/startup/mount_drives.sh &
```

Close and save the file. Now all you need to do is restart your device and when it loads your server should be available!

## Starting the Server
To start the server manually, open the project's root folder in a terminal and type ``npm start``. The application will run on port 3000 by default.

## Accessing the Application
To open the app, all you need to do is open a browser and go to the following URL: ``http://localhost:3000``.

## Compiling Typescript after modifying / creating .ts files
If you are using an IDE with typescript support, you will not need this. When you make any changes to a .ts file, or create one, you will need to compile them in order to view them in a browser. To accomplish this, simply navigate to the ``client`` folder in a command terminal, type ``gulp build`` and click enter. If you install any new JSPM packages and want them to be included in the vendor-build.js file (saves load time) then type ``gulp build:all``.
