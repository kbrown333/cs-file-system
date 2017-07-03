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

* JSPM and Typings can both be installed using npm.

## Instalation
First, open the project's root folder in a terminal and type ``npm install``

Next, open the ``client`` folder in the project root and enter the following commands:

- npm install
- jspm install -y
- typing install

## Configuration
You will need to do some minor command-line configuration to setup your hard drive(s). Before you go any further, take a look at our help output by opening a terminal in the project root folder and typing ``npm run help``. You should see some output that describes how to interact with our configuration CLI. Below is a copy of the output:

```
Set Config Variable: "node config.js keys [key] [value]"
Mount External Drive: "node config.js mount [alias] [path (blank for HD)]"
Generate Scripts: "node config.js scripts [type]"
```

The most important command to note is the "mount" command, which will create a database entry for your external hard drives. Before continuing, please make sure to plug at least 1 extneral hard drive into your linux machine. 

To set your hard drive up with the system, enter the following command (replacing 'my-drive' with whatever name you want).

``node config.js mount my-drive``

You can also have the server load a directory (recursively) on your linux machine. To accomplish this, enter the following command (replacing 'my-folder' with an alias and /home/pi/Videos with the folder path you want to mount):

``node config.js mount my-folder /home/pi/Videos``

IMPORTANT NOTE: do not inlcude spaces in your mount aliases, this could potentially cause problems with the server.

## Starting the Server
To run, open the project's root folder in a terminal and type ``npm start``. The application will run on port 3000 by default.

## Accessing the Application
To open the app, all you need to do is open a browser and go to the following URL: ``http://localhost:3000``.

## Compiling Typescript after modifying / creating .ts files
If you are using an IDE with typescript support, you will not need this. When you make any changes to a .ts file, or create one, you will need to compile them in order to view them in a browser. To accomplish this, simply navigate to the ``client`` folder in a command terminal, type ``gulp build`` and click enter. If you install any new JSPM packages and want them to be included in the vendor-build.js file (saves load time) then type ``gulp build:all``.
