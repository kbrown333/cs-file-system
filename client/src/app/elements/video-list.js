System.register(["aurelia-framework", "../models/FnTs"], function (exports_1, context_1) {
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
    var aurelia_framework_1, FnTs_1, VideoList;
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
            VideoList = class VideoList {
                constructor(fn) {
                    this.fn = fn;
                    this.visibility = {
                        main: { display: 'show', header: 'Video Groups' },
                        groups: { display: 'hide', header: '' }
                    };
                    this.nav = { index: 0, list: null, playlist: false };
                    this.view_header = 'Video Groups';
                    this.master_list = [];
                    this.selected_groups = [];
                    this.visible_group = {};
                    this.selected_filter_groups = [];
                    this.show_delete_vid_folder = 'hide';
                    this.show_delete_group = 'hide';
                    this.clickAddGroup = () => {
                        this.fn.mq.SendMessage({
                            event_name: 'showModal',
                            data: {
                                modal: 'add_playlist',
                                content: {
                                    title: 'Add Video Group',
                                    name: ''
                                },
                                reply_target: 'video-list'
                            }
                        });
                    };
                    this.addGroup = (name) => {
                        var req = {
                            url: '/api/videos/groups',
                            type: 'POST',
                            data: { new_group: name }
                        };
                        this.fn.fn_Ajax(req)
                            .then((data) => {
                            this.master_list.push({ name: name, filter_groups: [] });
                        });
                    };
                    this.clickBack = () => {
                        if (this.visibility.main.display == 'hide') {
                            this.visibility.main.display = 'show';
                            this.visibility.groups.display = 'hide';
                        }
                    };
                    this.clickForward = () => {
                        if (this.visibility.main.display == 'show' && this.visible_group.name != null) {
                            this.visibility.main.display = 'hide';
                            this.visibility.groups.display = 'show';
                        }
                    };
                    this.togglePanelBody = () => {
                        if (this.visibility.main.display == 'show') {
                            this.visibility.main.display = 'hide';
                            this.visibility.groups.display = 'show';
                        }
                        else {
                            this.visibility.main.display = 'show';
                            this.visibility.groups.display = 'hide';
                        }
                    };
                    this.toggleDeleteButtons = () => {
                        if (this.selected_filter_groups.length > 0) {
                            this.show_delete_vid_folder = 'show';
                        }
                        else {
                            this.show_delete_vid_folder = 'hide';
                        }
                        if (this.selected_groups.length > 0) {
                            this.show_delete_group = 'show';
                        }
                        else {
                            this.show_delete_group = 'hide';
                        }
                    };
                    this.clickDeleteGroups = () => {
                        if (this.selected_groups.length == 0) {
                            return;
                        }
                        var map = {};
                        for (var i = 0; i < this.selected_groups.length; i++) {
                            map[this.selected_groups[i].name] = true;
                        }
                        this.fn.fn_Ajax({
                            url: '/api/videos/groups/delete',
                            type: 'POST',
                            data: {
                                groups: JSON.stringify(map)
                            }
                        })
                            .then((data) => {
                            this.master_list = data;
                            this.selected_groups = [];
                            this.selected_filter_groups = [];
                            this.visible_group = {};
                        });
                    };
                    this.clickAddFilterGroup = () => {
                        this.fn.mq.SendMessage({
                            event_name: 'showModal',
                            data: {
                                modal: 'add_filter_group',
                                content: {
                                    title: 'Add Filter Group',
                                    fname: ''
                                },
                                reply_target: 'video-list'
                            }
                        });
                    };
                    this.addFilterGroup = (query) => {
                        if (query == null || query.trim() == "") {
                            return;
                        }
                        this.fn.fn_Ajax({
                            url: '/api/videos/groups/insert',
                            type: 'POST',
                            data: {
                                group: this.visible_group.name,
                                query: query
                            }
                        })
                            .then(this.updateMasterListItem);
                    };
                    this.clickDeleteFilterGroups = () => {
                        if (this.selected_filter_groups.length == 0) {
                            return;
                        }
                        this.fn.fn_Ajax({
                            url: '/api/videos/groups/remove',
                            type: 'POST',
                            data: {
                                group: this.visible_group.name,
                                queries: JSON.stringify(this.selected_filter_groups)
                            }
                        })
                            .then(this.updateMasterListItem);
                    };
                    this.updateMasterListItem = (data) => {
                        var index = -1;
                        this.master_list.filter((val, i) => {
                            if (val.name == data.name) {
                                index = i;
                                return true;
                            }
                        });
                        this.master_list[index].filter_groups = data.filter_groups;
                        this.visible_group = data;
                        $("li").removeClass('selected_track');
                    };
                    this.screenResize = (size = null) => {
                        this.resizeCategoryLists();
                    };
                    this.resizeCategoryLists = () => {
                        setTimeout(() => {
                            var height = $(window).height() - 150;
                            $('.category-list').css('max-height', height + "px");
                            $('.playlist-data').css('max-height', (height - 40) + "px");
                        }, 50);
                    };
                    this.selectGroup = (index) => {
                        this.visible_group = this.master_list[index];
                        this.togglePanelBody();
                    };
                    this.clickGroup = (data) => {
                        var elem = $(data.elem.parentElement);
                        var selected = elem.hasClass('selected_track');
                        if (selected) {
                            elem.removeClass('selected_track');
                            this.selected_groups = this.selected_groups.filter((val) => {
                                return val.name != data.data.name;
                            });
                        }
                        else {
                            elem.addClass('selected_track');
                            this.selected_groups.push(data.data);
                        }
                        this.toggleDeleteButtons();
                    };
                    this.clickFilterGroup = (data) => {
                        var elem = $(data.elem);
                        var selected = elem.hasClass('selected_track');
                        if (selected) {
                            elem.removeClass('selected_track');
                            this.selected_filter_groups = this.selected_filter_groups.filter((val) => {
                                return val != data.data;
                            });
                        }
                        else {
                            elem.addClass('selected_track');
                            this.selected_filter_groups.push(data.data);
                        }
                        this.toggleDeleteButtons();
                    };
                    this.onModalClose = (data) => {
                        switch (data.modal) {
                            case 'add_playlist':
                                this.addGroup(data.content.name);
                                break;
                            case 'add_filter_group':
                                this.addFilterGroup(data.content.query);
                                break;
                        }
                    };
                    this.fn.fn_Ajax({ url: '/api/videos/groups' })
                        .then((data) => {
                        this.master_list = data;
                    });
                }
                attached() {
                    this.app_events = this.fn.mq.Subscribe((event) => {
                        if (event.target != null && event.target != 'video-list') {
                            return;
                        }
                        if (this[event.event_name] != null) {
                            this[event.event_name](event.data);
                        }
                    });
                }
                detached() {
                    this.app_events.dispose();
                }
            };
            VideoList = __decorate([
                aurelia_framework_1.inject(FnTs_1.FnTs),
                __metadata("design:paramtypes", [FnTs_1.FnTs])
            ], VideoList);
            exports_1("VideoList", VideoList);
        }
    };
});
