import {inject, bindable, bindingMode} from 'aurelia-framework';
import {FnTs} from '../../../models/FnTs';

@bindable({name: 'current_path', defaultValue: '/'})
@bindable({name: 'display_path', defaultValue: ''})
@bindable({name: 'ajax_path', defaultValue: '/api/files/build' })
@inject(FnTs)
export class FilesPanel {

	app_events: any;
	ajax_path: any;
	files: any;
	directory: any = {};
	orig_directory: any = {};
	current_path: string;
	visible_folders: any;
	visible_files: any;
	selected_objects: any = [];
	cntl_enabled: boolean = false;
	hdr_btns: any = {
		select_all: 'hide',
		select_single: 'hide'
	}
	nav: any = {
		show_loader: 'show',
		show_files: 'hide',
		up_level: 'hide'
	}
	reduce_path = (a, b) => {return a + '/' + b;};

	constructor(private fn: FnTs) {

	}

	attached() {
		this.getFiles();
		this.app_events = this.fn.ea.subscribe('react', (event: any) => {
			if (this[event.event_name] != null) { this[event.event_name](event.data); }
		});
		this.screenResize();
		$('body').keydown((event: JQueryEventObject) => {
			if (event.which == 17) { this.cntl_enabled = true; }
		});
		$('body').keyup((event: JQueryEventObject) => {
			if (event.which == 17) { this.cntl_enabled = false; }
		});
		// $("#upload-input").on('change', () => {
		// 	this.upload_files_selected();
		// });
	}

	detached() {
		this.app_events.dispose();
	}

	show_loader() {
		this.nav.show_loader = 'show';
		this.nav.show_files = 'hide';
	}

	show_files() {
		this.nav.show_loader = 'hide';
		this.nav.show_files = 'show';
	}

	getFiles() {
		this.fn.fn_Ajax({url: this.ajax_path})
			.then((rslt) => {this.orig_directory = rslt; this.directory = rslt; return rslt;})
			.then(this.startRender)
			.then(this.getDirectory)
			.then(this.buildDirectory)
			.then(this.renderDirectory);
	}

	startRender = (data: any) => {
		return {
			directory: data,
			current_path: this.current_path
		};
	}

	getDirectory = (data: any): any => {
		if (data.current_path == "/") {
			data.current_directory = data.directory;
			return data;
		}
		var dir = data.directory;
		var tmp = data.current_path.split('/');
		var path;
		for (var i = 1; i < tmp.length; i++) {
			path = tmp[i];
			dir = dir[path];
		}
		data.current_directory = dir;
		return data;
	}

	buildDirectory(data: any) {
		var files = [], folders = [];
		var dir = data.current_directory;
		if (dir != null) {
			if (dir['_files_'] != null) { files = dir['_files_']; }
			for (var obj in dir) {
				if (obj != '_files_') {
					folders.push(obj);
				}
			}
		}
		$('.selected_block').removeClass('selected_block');
		data.visible_files = files;
		data.visible_folders = folders;
		return data;
	}

	renderDirectory =  (data: any) => {
		this.current_path = data.current_path;
		this.directory = data.directory;
		this.visible_files = data.visible_files;
		this.visible_folders = data.visible_folders;
		if (data.files != null) { this.files = data.files; }
		if (data.current_path == "/") {
			this.nav.up_level = 'hide';
		} else {
			this.nav.up_level = 'show';
		}
		setTimeout(() => {
			//this.register_drag_drop();
			this.show_files();
		}, 500);
	}

	step_into(folder: string): void {
		var path = this.current_path == '/' ? '' : this.current_path;
		var data = {
			directory: this.directory,
			current_path: path + '/' + folder
		};
		data = this.getDirectory(data);
		data = this.buildDirectory(data);
		this.renderDirectory(data);
	}

	step_back(): void {
		var tmp = this.current_path.split('/');
		var path = "";
		for (var i = 1; i < tmp.length - 1; i++) {
			path += "/" + tmp[i];
		}
		if (path == "") {path = "/";}
		var data = {directory: this.directory, current_path: path};
		data = this.getDirectory(data);
		this.renderDirectory(this.buildDirectory(data));
	}

	//Folder / File Selection
	select_block(elem: any, index: number, type: string): void {
		var select;
		if (this.cntl_enabled) {
			if (elem.hasClass('selected_block')) {
				elem.removeClass('selected_block');
				select = false;
			} else {
				elem.addClass('selected_block');
				select = true;
			}
		} else {
			if (elem.hasClass('selected_block')) {
				$(".icon-block").removeClass('selected_block');
				select = false;
			} else {
				$(".icon-block").removeClass('selected_block');
				elem.addClass('selected_block');
				select = true;
			}
		}
		var count = this.set_button_status();
		var fetch_obj;
		if (type == "file") {
			fetch_obj = this.visible_files;
		} else {
			fetch_obj = this.visible_folders;
		}
		if (count == 0) {
			this.selected_objects = [];
		} else if (count == 1) {elem
			this.selected_objects = [];
			this.selected_objects.push(fetch_obj[index]);
		} else {
			if (select) {
				this.selected_objects.push(fetch_obj[index]);
			} else {
				var name = fetch_obj[index];
				var i = this.selected_objects.indexOf(name);
				this.selected_objects.splice(i, 1);
			}
		}
	}

	set_button_status(): number {
		var count = $(".selected_block").length;
		if (count == 0) {
			this.hdr_btns.select_all = 'hide';
			this.hdr_btns.select_single = 'hide';
		} else if (count == 1) {
			this.hdr_btns.select_all = 'inline-block';
			this.hdr_btns.select_single = 'inline-block';
		} else {
			this.hdr_btns.select_all = 'inline-block';
			this.hdr_btns.select_single = 'hide';
		}
		return count;
	}

	//Event Aggregator Functions
	screenResize(size: any = null): void {
		var height, width;
		if (size == null) { height = $(window).height(); width = $(window).width(); }
		else { height = size.height; width = size.width; }
		var offset = width > 768 ? 150 : 190;
		height = height - offset;
		$('.panel-body[panel-type="files-panel"]').css('height', height + 'px');
	}

	loadPage(page: string) {
		this.current_path = '/' + page;
		this.fn.ea.publish('react', {event_name: 'toggle_aside'});
		var data = { files: this.files };
		this.startRender(data);
	}

	openFolder(data: string) {
		if (data == "...") {
			this.step_back();
		} else {
			this.step_into(data);
		}
	}

	openFile(file: any) {
		var types = {
			'mp3': 'loadMusicFile',
			'mp4': 'loadVideoFile',
			'jpeg': 'loadPictureFile',
			'jpg': 'loadPictureFile',
			'png': 'loadPictureFile',
			'gif': 'loadPictureFile'
		}
		var ext = file.substring(file.lastIndexOf('.') + 1);
		var event = types[ext];
		var data = {
				selected:  this.current_path + '/' + file,
				all_files: this.visible_files,
				path: this.current_path + '/',
				original: file
		};
		this.fn.ea.publish('react', {event_name: event, data: data});
	}

	selectFolder(index: number) {
		var elem = $($('.icon-block[block-type="folder"]')[index]);
		this.select_block(elem, index, 'folder');
	}

	selectFile(index: number) {
		var elem = $($('.icon-block[block-type="file"]')[index]);
		this.select_block(elem, index, 'file');
	}

}
