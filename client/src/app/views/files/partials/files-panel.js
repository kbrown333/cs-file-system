System.register(["aurelia-framework", "../../../models/FnTs"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __moduleName = context_1 && context_1.id;
    var aurelia_framework_1, FnTs_1, FilesPanel;
    return {
        setters: [
            function (aurelia_framework_1_1) {
                aurelia_framework_1 = aurelia_framework_1_1;
            },
            function (FnTs_1_1) {
                FnTs_1 = FnTs_1_1;
            }
        ],
        execute: function () {
            FilesPanel = class FilesPanel {
                constructor(fn) {
                    this.fn = fn;
                    this.directory = {};
                    this.orig_directory = {};
                    this.is_root = true;
                    this.selected_objects = [];
                    this.cntl_enabled = false;
                    this.hdr_btns = {
                        select_all: 'hide',
                        select_single: 'hide'
                    };
                    this.nav = {
                        show_loader: 'show',
                        show_files: 'hide',
                        up_level: 'hide'
                    };
                    this.draggable_loaded = false;
                    this.reduce_path = (a, b) => { return a + '/' + b; };
                    this.loadAllData = (data) => {
                        return new Promise((res, err) => {
                            Promise.resolve(data)
                                .then(this.startRender)
                                .then(this.getDirectory)
                                .then(this.buildDirectory)
                                .then(this.renderDirectory)
                                .then((rslt) => { res(rslt); })
                                .catch((error) => { err(error); });
                        });
                    };
                    this.startRender = (data) => {
                        return {
                            directory: data,
                            current_path: this.current_path
                        };
                    };
                    this.getDirectory = (data) => {
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
                    };
                    this.renderDirectory = (data) => {
                        this.current_path = data.current_path;
                        this.directory = data.directory;
                        this.visible_files = data.visible_files;
                        this.visible_folders = data.visible_folders;
                        if (data.files != null) {
                            this.files = data.files;
                        }
                        if (this.is_root) {
                            this.setDrivePath();
                        }
                        if (data.current_path == "/") {
                            this.nav.up_level = 'hide';
                            this.is_root = true;
                        }
                        else {
                            this.nav.up_level = 'show';
                            this.is_root = false;
                        }
                        setTimeout(() => {
                            this.register_drag_drop();
                            this.show_files();
                        }, 500);
                        return data;
                    };
                    this.setDrivePath = () => {
                        var tmp = this.current_path.split('/');
                        tmp = tmp.filter((val) => { return val != ""; });
                        if (tmp.length > 0) {
                            this.current_drive = tmp[0];
                        }
                    };
                    this.is_first_level = () => {
                        var tmp = this.current_path.split('/');
                        tmp.pop();
                        tmp = tmp.filter((val) => { return val != ""; });
                        return tmp.length == 0;
                    };
                }
                attached() {
                    this.getFiles();
                    this.app_events = this.fn.ea.subscribe('react', (event) => {
                        if (this[event.event_name] != null) {
                            this[event.event_name](event.data);
                        }
                    });
                    this.screenResize();
                    $('body').keydown((event) => {
                        if (event.which == 17) {
                            this.cntl_enabled = true;
                        }
                    });
                    $('body').keyup((event) => {
                        if (event.which == 17) {
                            this.cntl_enabled = false;
                        }
                    });
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
                    this.fn.fn_Ajax({ url: this.ajax_path })
                        .then((rslt) => { this.orig_directory = rslt; this.directory = rslt; return rslt; })
                        .then(this.loadAllData);
                }
                buildDirectory(data) {
                    var files = [], folders = [];
                    var dir = data.current_directory;
                    if (dir != null) {
                        if (dir['_files_'] != null) {
                            files = dir['_files_'];
                        }
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
                step_into(folder) {
                    var path = this.current_path == '/' ? '' : this.current_path;
                    var data = {
                        directory: this.directory,
                        current_path: path + '/' + folder
                    };
                    data = this.getDirectory(data);
                    data = this.buildDirectory(data);
                    this.renderDirectory(data);
                }
                step_back() {
                    var tmp = this.current_path.split('/');
                    var path = "";
                    for (var i = 1; i < tmp.length - 1; i++) {
                        path += "/" + tmp[i];
                    }
                    if (path == "") {
                        path = "/";
                    }
                    var data = { directory: this.directory, current_path: path };
                    data = this.getDirectory(data);
                    this.renderDirectory(this.buildDirectory(data));
                }
                register_drag_drop() {
                    var move = (from, to, is_folder) => {
                        this.move_object(from, to, is_folder);
                    };
                    if (this.is_root) {
                        if (this.draggable_loaded) {
                            $(".drag_me").draggable('disable');
                        }
                        return;
                    }
                    $(".drag_me").draggable({ revert: true });
                    $(".drop_here").droppable({
                        classes: {
                            "ui-droppable-active": "ui-state-active",
                            "ui-droppable-hover": "ui-state-hover"
                        },
                        drop: function (event, ui) {
                            var from = $(".hidden_input", ui.draggable).val();
                            var to = $(".hidden_input", this).val();
                            var is_folder = $(ui.draggable).attr('block-type') == 'folder';
                            move(from, to, is_folder);
                        }
                    });
                    this.draggable_loaded = true;
                    if (this.is_first_level()) {
                        $('.drop_here[cs-flag="up_level"]').droppable("option", "disabled", true);
                    }
                }
                move_object(obj, folder, is_folder) {
                    this.show_loader();
                    var old_path = this.current_path + '/' + obj;
                    var dest;
                    if (folder == "...") {
                        var tmp = this.current_path.split('/');
                        tmp.pop();
                        tmp = tmp.filter((val) => { return val != ""; });
                        dest = tmp.reduce(this.reduce_path, '');
                        dest += ("/" + obj);
                    }
                    else {
                        dest = this.current_path + "/" + folder + "/" + obj;
                    }
                    var data = {
                        data: { old_name: old_path, new_name: dest },
                        url: '/api/files/mod/rename',
                        type: 'POST'
                    };
                    this.fn.fn_Ajax(data)
                        .then(this.loadAllData)
                        .catch((err) => {
                        console.log(err.responseText);
                        this.show_files();
                    });
                }
                select_block(elem, index, type) {
                    var select;
                    if (this.cntl_enabled) {
                        if (elem.hasClass('selected_block')) {
                            elem.removeClass('selected_block');
                            select = false;
                        }
                        else {
                            elem.addClass('selected_block');
                            select = true;
                        }
                    }
                    else {
                        if (elem.hasClass('selected_block')) {
                            $(".icon-block").removeClass('selected_block');
                            select = false;
                        }
                        else {
                            $(".icon-block").removeClass('selected_block');
                            elem.addClass('selected_block');
                            select = true;
                        }
                    }
                    var count = this.set_button_status();
                    var fetch_obj;
                    if (type == "file") {
                        fetch_obj = this.visible_files;
                    }
                    else {
                        fetch_obj = this.visible_folders;
                    }
                    if (count == 0) {
                        this.selected_objects = [];
                    }
                    else if (count == 1) {
                        elem;
                        this.selected_objects = [];
                        this.selected_objects.push(fetch_obj[index]);
                    }
                    else {
                        if (select) {
                            this.selected_objects.push(fetch_obj[index]);
                        }
                        else {
                            var name = fetch_obj[index];
                            var i = this.selected_objects.indexOf(name);
                            this.selected_objects.splice(i, 1);
                        }
                    }
                }
                set_button_status() {
                    var count = $(".selected_block").length;
                    if (count == 0) {
                        this.hdr_btns.select_all = 'hide';
                        this.hdr_btns.select_single = 'hide';
                    }
                    else if (count == 1) {
                        this.hdr_btns.select_all = 'inline-block';
                        this.hdr_btns.select_single = 'inline-block';
                    }
                    else {
                        this.hdr_btns.select_all = 'inline-block';
                        this.hdr_btns.select_single = 'hide';
                    }
                    return count;
                }
                screenResize(size = null) {
                    var height, width;
                    if (size == null) {
                        height = $(window).height();
                        width = $(window).width();
                    }
                    else {
                        height = size.height;
                        width = size.width;
                    }
                    var offset = width > 768 ? 150 : 190;
                    height = height - offset;
                    $('.panel-body[panel-type="files-panel"]').css('height', height + 'px');
                }
                loadPage(page) {
                    this.current_path = '/' + page;
                    this.fn.ea.publish('react', { event_name: 'toggle_aside' });
                    var data = { files: this.files };
                    this.startRender(data);
                }
                openFolder(data) {
                    if (data == "...") {
                        this.step_back();
                    }
                    else {
                        this.step_into(data);
                    }
                }
                openFile(file) {
                    var types = {
                        'mp3': 'loadMusicFile',
                        'mp4': 'loadVideoFile',
                        'jpeg': 'loadPictureFile',
                        'jpg': 'loadPictureFile',
                        'png': 'loadPictureFile',
                        'gif': 'loadPictureFile'
                    };
                    var ext = file.substring(file.lastIndexOf('.') + 1);
                    var event = types[ext];
                    var data = {
                        selected: this.current_path + '/' + file,
                        all_files: this.visible_files,
                        path: this.current_path + '/',
                        original: file
                    };
                    this.fn.ea.publish('react', { event_name: event, data: data });
                }
                selectFolder(index) {
                    index++;
                    var elem = $($('.icon-block[block-type="folder"]')[index]);
                    this.select_block(elem, index, 'folder');
                }
                selectFile(index) {
                    var elem = $($('.icon-block[block-type="file"]')[index]);
                    this.select_block(elem, index, 'file');
                }
            };
            FilesPanel = __decorate([
                aurelia_framework_1.bindable({ name: 'current_path', defaultValue: '/' }),
                aurelia_framework_1.bindable({ name: 'display_path', defaultValue: '' }),
                aurelia_framework_1.bindable({ name: 'ajax_path', defaultValue: '/api/files/build' }),
                aurelia_framework_1.inject(FnTs_1.FnTs),
                __metadata("design:paramtypes", [FnTs_1.FnTs])
            ], FilesPanel);
            exports_1("FilesPanel", FilesPanel);
        }
    };
});
