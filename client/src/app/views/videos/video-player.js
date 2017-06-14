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
                    this.now_playing = '';
                    this.index = -1;
                    this.loadVideoFile = (data) => {
                        this.changeVideo(data.path);
                        this.now_playing = data.name;
                    };
                    this.changeVideo = (link) => {
                        var player = document.getElementById('vid_player');
                        var video = document.getElementById('vid_src');
                        player.pause();
                        video.src = link;
                        player.load();
                        player.play();
                        document.getElementById('vid_player').addEventListener('ended', () => {
                            setTimeout(() => { this.next(); }, 5000);
                        }, false);
                    };
                    this.next = () => {
                        if (this.index > -1 && this.index < this.videos.length - 1) {
                            this.loadVideoFile(this.videos[++this.index]);
                        }
                    };
                    this.prev = () => {
                        if (this.index > 0) {
                            this.loadVideoFile(this.videos[--this.index]);
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
                    this.getVideoList();
                    this.screenResize();
                }
                detached() {
                    this.app_events.dispose();
                }
                getVideoList() {
                    this.fn.fn_Ajax({ url: '/api/videos/mp4' })
                        .then((rslt) => {
                        this.videos = rslt;
                        if (rslt.length > 0) {
                            var player = document.getElementById('vid_player');
                            var video = document.getElementById('vid_src');
                            video.src = rslt[0].path;
                            this.now_playing = rslt[0].name;
                            player.load();
                            this.index = 0;
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
