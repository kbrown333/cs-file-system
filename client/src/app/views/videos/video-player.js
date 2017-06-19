System.register(["aurelia-framework", "../../models/FnTs"], function (exports_1, context_1) {
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
    var aurelia_framework_1, FnTs_1, VideoPlayer;
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
            VideoPlayer = class VideoPlayer {
                constructor(fn) {
                    this.fn = fn;
                    this.videos = [];
                    this.visible_videos = [];
                    this.now_playing = '';
                    this.index = -1;
                    this.manual_load = false;
                    this.visibility = {
                        videos: 'show',
                        list: 'hide'
                    };
                    this.vid_finished = false;
                    this.toggleListView = () => {
                        if (this.visibility.videos == 'show') {
                            this.visibility.videos = 'hide';
                            this.visibility.list = 'show';
                            this.fn.mq.SendMessage({ event_name: 'resizeCategoryLists', target: 'video-list' });
                            $('#btn-vid-list-view').addClass('list-view-selected');
                        }
                        else {
                            this.visibility.videos = 'show';
                            this.visibility.list = 'hide';
                            $('#btn-vid-list-view').removeClass('list-view-selected');
                        }
                    };
                    this.loadVideoPlayer = (data, no_start = false, index = null) => {
                        this.changeVideo(data.path, no_start);
                        if (index != null)
                            this.index = index;
                        this.now_playing = data.name;
                    };
                    this.loadVideosFromList = (all_videos, data) => {
                        var map = {};
                        for (var i = 0; i < all_videos.length; i++) {
                            map[all_videos[i].path] = true;
                        }
                        var video_files = [];
                        var start = 'media/' + data.path.substring(1, data.path.length);
                        var index = 0;
                        for (var i = 0; i < data.all_files.length; i++) {
                            if (map[start + data.all_files[i]]) {
                                if (data.path + data.all_files[i] == data.selected) {
                                    index = video_files.length;
                                }
                                video_files.push({
                                    path: start + data.all_files[i],
                                    name: data.all_files[i]
                                });
                            }
                        }
                        if (video_files.length > 0) {
                            this.index = index;
                            this.videos = video_files;
                            this.visible_videos = $.extend(true, [], video_files);
                            this.loadVideoPlayer(video_files[index], true);
                        }
                    };
                    this.changeVideo = (link, no_start = false) => {
                        var player = document.getElementById('vid_player');
                        var video = document.getElementById('vid_src');
                        if (!this.vid_finished)
                            player.pause();
                        else
                            this.vid_finished = false;
                        video.src = link;
                        player.load();
                        if (!no_start)
                            player.play();
                    };
                    this.next = () => {
                        if (this.index > -1 && this.index < this.visible_videos.length - 1) {
                            this.loadVideoPlayer(this.visible_videos[++this.index]);
                        }
                    };
                    this.prev = () => {
                        if (this.index > 0) {
                            this.loadVideoPlayer(this.visible_videos[--this.index]);
                        }
                    };
                    this.toggleSearchBox = () => {
                        $('.panel-body[panel-type="video-list"]').toggleClass('searching');
                    };
                    this.searchVideos = (event, force = false) => {
                        if (event.which == 13 || force) {
                            var val = $("input", ".srch-video-box").val().trim();
                            if (val == "") {
                                this.visible_videos = $.extend(true, [], this.videos);
                            }
                            else {
                                this.visible_videos = this.videos.filter((vid) => {
                                    return vid.path.toLowerCase().indexOf(val.toLowerCase()) != -1;
                                });
                            }
                        }
                    };
                    this.screenResize = (size = null) => {
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
                        $('.panel-body[panel-type="video-panel"]').css('height', height + 'px');
                        $('.panel-body[panel-type="video-list"]').css('height', height + 'px');
                    };
                }
                attached() {
                    this.app_events = this.fn.ea.subscribe('react', (event) => {
                        if (this[event.event_name] != null) {
                            this[event.event_name](event.data);
                        }
                    });
                    this.screenResize();
                    document.getElementById('vid_player').addEventListener('ended', () => {
                        this.vid_finished = true;
                        setTimeout(() => { this.next(); }, 5000);
                    }, false);
                    if (this.manual_load) {
                        this.getVideoList(this.manual_data);
                    }
                    else {
                        this.getVideoList();
                    }
                    $("input", ".srch-video-box").keyup(this.searchVideos);
                    $("input", ".srch-video-box").focusout(() => { this.searchVideos({}, true); });
                }
                detached() {
                    this.app_events.dispose();
                }
                activate(parms = null) {
                    if (parms != null && parms.all_files != null) {
                        this.manual_load = true;
                        this.manual_data = parms;
                    }
                }
                getVideoList(data = null) {
                    this.fn.fn_Ajax({ url: '/api/videos/mp4' })
                        .then((rslt) => {
                        if (rslt.length <= 0)
                            return;
                        if (data != null)
                            this.loadVideosFromList(rslt, data);
                        else {
                            this.videos = rslt;
                            this.visible_videos = $.extend(true, [], rslt);
                            this.index = 0;
                            this.loadVideoPlayer(rslt[0], true);
                        }
                    });
                }
            };
            VideoPlayer = __decorate([
                aurelia_framework_1.inject(FnTs_1.FnTs),
                __metadata("design:paramtypes", [FnTs_1.FnTs])
            ], VideoPlayer);
            exports_1("VideoPlayer", VideoPlayer);
        }
    };
});
