System.register(["aurelia-framework", "../../../models/FnTs", "../../../models/session"], function (exports_1, context_1) {
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
    var aurelia_framework_1, FnTs_1, session_1, FilesPanel;
    return {
        setters: [
            function (aurelia_framework_1_1) {
                aurelia_framework_1 = aurelia_framework_1_1;
            },
            function (FnTs_1_1) {
                FnTs_1 = FnTs_1_1;
            },
            function (session_1_1) {
                session_1 = session_1_1;
            }
        ],
        execute: function () {
            FilesPanel = class FilesPanel {
                constructor(fn, session) {
                    this.fn = fn;
                    this.session = session;
                    this.directory = {};
                    this.orig_directory = {};
                    this.is_root = true;
                    this.selected_objects = [];
                    this.cntl_enabled = false;
                    this.hdr_btns = {
                        all: 'hide',
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
                            this.hdr_btns.all = 'hide';
                            this.nav.up_level = 'hide';
                            this.is_root = true;
                        }
                        else {
                            this.hdr_btns.all = 'show';
                            this.nav.up_level = 'show';
                            this.is_root = false;
                        }
                        setTimeout(() => {
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
                    this.copy_files = () => {
                        this.session.runtime['clipboard'] = {
                            data: this.selected_objects,
                            path: this.get_subpath(this.current_path),
                            drive: this.current_drive,
                            type: 'cut'
                        };
                        this.fn.mq.SendMessage({ event_name: 'displayToast', target: 'app', data: 'Files Copied' });
                    };
                    this.paste_files = () => {
                        var clip = this.session.runtime['clipboard'];
                        if (clip == null) {
                            return;
                        }
                        var subpath = this.get_subpath(this.current_path);
                        if (clip.path == subpath && clip.drive == this.current_drive) {
                            return;
                        }
                        if (!this.validateCopy(clip, clip.path, subpath, clip.drive, this.current_drive)) {
                            alert('Cannot copy a folder to one of its subdirectories.');
                            return;
                        }
                        var data = {
                            url: '/api/files/mod/copy',
                            type: 'POST',
                            data: {
                                contents: JSON.stringify(clip.data),
                                from_drive: clip.drive,
                                from_path: clip.path,
                                to_drive: this.current_drive,
                                to_path: subpath
                            }
                        };
                        this.fn.fn_Ajax(data)
                            .then(this.loadAllData)
                            .catch((err) => {
                            console.log(err.responseText);
                            this.show_files();
                        });
                    };
                    this.click_upload_btn = () => {
                        $('#upload-input').click();
                    };
                    this.delete_files = () => {
                        var data = {
                            url: '/api/files/mod/delete',
                            type: 'POST',
                            data: {
                                contents: JSON.stringify(this.selected_objects),
                                from_path: this.get_subpath(this.current_path),
                                from_drive: this.current_drive
                            }
                        };
                        this.fn.fn_Ajax(data)
                            .then(this.loadAllData)
                            .catch((err) => {
                            console.log(err.responseText);
                            this.show_files();
                        });
                    };
                    this.download_file = () => {
                        var items = this.selected_objects;
                        if (items.length > 1) {
                            alert('Only 1 file at a time allowed for downloads');
                        }
                        var rt = this.get_subpath(this.current_path);
                        if (rt != '/')
                            rt += '/';
                        var file = rt + items[0].name;
                        window.open('/api/files/download?drive=' + this.current_drive + '&file=' + file);
                    };
                    this.open_add_folder = () => {
                        this.fn.mq.SendMessage({
                            event_name: 'showModal',
                            data: {
                                modal: 'add_folder',
                                content: {
                                    title: 'Add New Folder',
                                    fname: ''
                                }
                            }
                        });
                    };
                    this.open_rename_modal = () => {
                        this.fn.mq.SendMessage({
                            event_name: 'showModal',
                            data: {
                                modal: 'edit_fname',
                                content: {
                                    title: 'Edit File Name',
                                    fname: this.selected_objects[0].name
                                }
                            }
                        });
                    };
                    this.rename_file = (old_name, new_name) => {
                        var data = {
                            type: 'POST',
                            url: '/api/files/mod/rename',
                            data: {
                                old_name: old_name,
                                new_name: new_name,
                                from_path: this.get_subpath(this.current_path),
                                from_drive: this.current_drive
                            }
                        };
                        this.fn.fn_Ajax(data)
                            .then(this.loadAllData)
                            .catch((err) => {
                            console.log(err.responseText);
                            this.show_files();
                        });
                    };
                }
                attached() {
                    this.getFiles();
                    this.app_events = this.fn.mq.Subscribe((event) => {
                        if (event.target != null && event.target != 'files-panel') {
                            return;
                        }
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
                    $("#upload-input").on('change', () => {
                        this.upload_files_selected();
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
                getDirectory(data) {
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
                get_subpath(curr_path) {
                    var tmp = curr_path.split('/');
                    tmp = tmp.filter((val) => { return val != ""; });
                    if (tmp.length > 1) {
                        return tmp.slice(1).reduce(this.reduce_path, '');
                    }
                    else {
                        return "/";
                    }
                }
                validateCopy(clip, from_path, to_path, from_drive, to_drive) {
                    var folders = clip.data.filter((val) => { return val.type == 'folder'; });
                    if (folders.length == 0) {
                        return true;
                    }
                    if (from_drive == to_drive && to_path.includes(from_path)) {
                        return false;
                    }
                    return true;
                }
                upload_files_selected() {
                    var files = $('#upload-input').get(0).files;
                    if (files.length > 0) {
                        var formData = new FormData();
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i];
                            formData.append('uploads[]', file, file.name);
                        }
                        this.upload(formData);
                    }
                }
                upload(formData) {
                    var data = {
                        url: '/api/files/upload',
                        type: 'POST',
                        headers: {
                            'x-path': this.get_subpath(this.current_path),
                            'x-drive': this.current_drive
                        },
                        data: formData,
                        processData: false,
                        contentType: false
                    };
                    this.fn.fn_Ajax(data)
                        .then(this.loadAllData);
                }
                add_new_folder(folder_name) {
                    var data = {
                        type: 'POST',
                        url: '/api/files/mod/new_folder',
                        data: {
                            folder_name: folder_name,
                            from_path: this.get_subpath(this.current_path),
                            from_drive: this.current_drive
                        }
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
                    var fetch_obj;
                    if (type == "file") {
                        fetch_obj = this.visible_files;
                    }
                    else {
                        fetch_obj = this.visible_folders;
                    }
                    var count = this.set_button_status();
                    if (count == 0) {
                        this.selected_objects = [];
                    }
                    else if (count == 1) {
                        this.selected_objects = [];
                        this.selected_objects.push({ name: fetch_obj[index], type: type });
                    }
                    else {
                        if (select) {
                            this.selected_objects.push({ name: fetch_obj[index], type: type });
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
                    this.fn.mq.SendMessage({ event_name: 'toggle_aside' });
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
                        'mp4': 'loadVideoFile'
                    };
                    var ext = file.substring(file.lastIndexOf('.') + 1);
                    var event = types[ext];
                    var data = {
                        selected: this.current_path + '/' + file,
                        all_files: this.visible_files,
                        path: this.current_path + '/',
                        original: file
                    };
                    this.fn.mq.SendMessage({ event_name: event, data: data });
                }
                selectFolder(index) {
                    var elem = $($('.icon-block[block-type="folder"]')[index + 1]);
                    this.select_block(elem, index, 'folder');
                }
                selectFile(index) {
                    var elem = $($('.icon-block[block-type="file"]')[index]);
                    this.select_block(elem, index, 'file');
                }
                onModalClose(data) {
                    switch (data.modal) {
                        case 'edit_fname':
                            this.rename_file(this.selected_objects[0].name, data.content.fname);
                            break;
                        case 'add_folder':
                            this.add_new_folder(data.content.fname);
                            break;
                    }
                }
            };
            FilesPanel = __decorate([
                aurelia_framework_1.bindable({ name: 'current_path', defaultValue: '/' }),
                aurelia_framework_1.bindable({ name: 'display_path', defaultValue: '' }),
                aurelia_framework_1.bindable({ name: 'ajax_path', defaultValue: '/api/files/build' }),
                aurelia_framework_1.inject(FnTs_1.FnTs, session_1.SessionData),
                __metadata("design:paramtypes", [FnTs_1.FnTs, session_1.SessionData])
            ], FilesPanel);
            exports_1("FilesPanel", FilesPanel);
        }
    };
});
