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
    var aurelia_framework_1, FnTs_1, MusicPlayer;
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
            MusicPlayer = class MusicPlayer {
                constructor(fn) {
                    this.fn = fn;
                    this.route_prefix = 'media/';
                    this.visibility = {
                        player: 'show',
                        list: 'hide'
                    };
                    this.shuffle_passes = 2;
                    this.shuffle_single = false;
                    this.continuous = false;
                    this.shuffle = false;
                    this.muted = false;
                    this.loaded = false;
                    this.toggleListView = () => {
                        if (this.visibility.player == 'show') {
                            this.visibility.player = 'hide';
                            this.visibility.list = 'show';
                            this.fn.mq.SendMessage({ event_name: 'resizeCategoryLists', target: 'music-list' });
                            $('#btn-list-view').addClass('list-view-selected');
                        }
                        else {
                            this.visibility.player = 'show';
                            this.visibility.list = 'hide';
                            $('#btn-list-view').removeClass('list-view-selected');
                        }
                    };
                    this.getMusicList = (data) => {
                        return new Promise((res) => {
                            var req = {
                                url: '/api/music/songs'
                            };
                            var callback = (list) => {
                                data.map = list;
                                res(data);
                            };
                            this.fn.fn_Ajax(req)
                                .then(callback);
                        });
                    };
                    this.generateBindableList = (data) => {
                        var keys = Object.keys(data.map);
                        data.list = keys.map((val) => {
                            return data.map[val];
                        });
                        return data;
                    };
                    this.loadMasterData = (data) => {
                        this.player = data.player;
                        this.song_index = 0;
                        this.master_map = data.map;
                        this.master_list = data.list;
                        this.player.on("ready", () => {
                            this.track_time.current = "0:00";
                            this.track_time.total = this.secondsToMinutes(this.player.getDuration());
                            if (this.continuous) {
                                this.play();
                            }
                        });
                        this.player.on("finish", () => {
                            if (this.continuous) {
                                this.nextSong();
                            }
                            else {
                                $("#play-btn").removeClass('icon_selected');
                            }
                        });
                        this.player.on("audioprocess", () => {
                            var time = this.player.backend.getCurrentTime();
                            if (time > 0) {
                                this.track_time.current = this.secondsToMinutes(time);
                            }
                        });
                        var slider = document.querySelector('#slider');
                        slider.oninput = () => {
                            var vol = Number(slider.value) / 100;
                            this.player.setVolume(vol);
                        };
                        this.player.setVolume(.25);
                        return data;
                    };
                    this.getSongMap = () => {
                        var req = {
                            url: '/api/music/map'
                        };
                        this.fn.fn_Ajax(req)
                            .then((list) => { this.song_map = list; });
                    };
                    this.loadPlayer = (data, track = null) => {
                        this.song_map = data.map;
                        var start = track == null ? data.list[0] : track;
                        this.loadTrackList(data.list, start);
                        this.resizeTrackList();
                    };
                    this.loadTrackList = (list, track) => {
                        this.song_list = list;
                        this.changeTrack(track);
                    };
                    this.clickPlayTrack = (index, track) => {
                        this.song_index = index;
                        this.changeTrack(track);
                    };
                    this.changeTrack = (track) => {
                        this.player.load(this.route_prefix + track.path);
                        this.now_playing = track;
                    };
                    this.play = () => {
                        this.player.play();
                        $("#pause-btn").removeClass('icon_selected');
                        $("#play-btn").addClass('icon_selected');
                    };
                    this.pause = () => {
                        this.player.pause();
                        $("#pause-btn").addClass('icon_selected');
                        $("#play-btn").removeClass('icon_selected');
                    };
                    this.prevSong = () => {
                        if (this.song_index > 0) {
                            this.song_index--;
                            this.changeTrack(this.song_list[this.song_index]);
                        }
                    };
                    this.nextSong = () => {
                        if (this.shuffle) {
                            this.randomSong();
                        }
                        else {
                            if (this.song_index < this.song_list.length - 1) {
                                this.song_index++;
                                this.changeTrack(this.song_list[this.song_index]);
                            }
                        }
                    };
                    this.randomSong = () => {
                        if (this.shuffle_list.length == this.shuffle_index) {
                            this.shuffle_index = 0;
                            this.generateShuffle();
                        }
                        var track = this.shuffle_list[this.shuffle_index];
                        if (track.artist == this.now_playing.artist && !this.shuffle_single) {
                            this.shuffle_index++;
                            this.randomSong();
                        }
                        else {
                            this.changeTrack(track);
                            this.shuffle_history.push(track.path);
                            this.shuffle_index++;
                        }
                    };
                    this.toggleContinuous = () => {
                        if (this.continuous) {
                            this.continuous = false;
                            $("#continue-btn").removeClass('icon_selected');
                        }
                        else {
                            this.continuous = true;
                            $("#continue-btn").addClass('icon_selected');
                        }
                    };
                    this.toggleShuffle = () => {
                        if (this.shuffle) {
                            this.shuffle = false;
                            $("#shuffle-btn").removeClass('icon_selected');
                        }
                        else {
                            if (this.generateShuffle()) {
                                this.shuffle = true;
                                $("#shuffle-btn").addClass('icon_selected');
                            }
                        }
                    };
                    this.toggleMute = () => {
                        if (this.muted) {
                            $("#vol-btn").removeClass('fa-volume-off');
                            $("#vol-btn").addClass('fa-volume-up');
                            $("#vol-btn").addClass('icon_selected');
                            this.muted = false;
                        }
                        else {
                            $("#vol-btn").removeClass('fa-volume-up');
                            $("#vol-btn").addClass('fa-volume-off');
                            $("#vol-btn").removeClass('icon_selected');
                            this.muted = true;
                        }
                        this.player.toggleMute();
                    };
                    this.generateShuffle = () => {
                        this.shuffle_single = false;
                        var data = this.prelimShuffle();
                        var list = data.obj;
                        for (var i = 0; i < this.shuffle_passes; i++) {
                            list = this.randomShuffle(list);
                        }
                        this.shuffle_history = [];
                        this.shuffle_index = 0;
                        this.shuffle_list = list;
                        if (Object.keys(data.dist).length <= 1) {
                            this.shuffle_single = true;
                        }
                        return true;
                    };
                    this.prelimShuffle = () => {
                        var keys = Object.keys(this.song_map);
                        var count = 0, a = [], tmp;
                        var dist = {};
                        while (keys.length > 0) {
                            if (count % 2 == 0) {
                                tmp = keys.shift();
                            }
                            else {
                                tmp = keys.pop();
                            }
                            a.push(this.song_map[tmp]);
                            if (dist[this.song_map[tmp].artist] == null) {
                                dist[this.song_map[tmp].artist] = 1;
                            }
                            else {
                                dist[this.song_map[tmp].artist]++;
                            }
                            count++;
                        }
                        return { obj: a, dist: dist };
                    };
                    this.randomShuffle = (a) => {
                        var j, x, i;
                        for (i = a.length; i; i--) {
                            j = Math.floor(Math.random() * i);
                            x = a[i - 1];
                            a[i - 1] = a[j];
                            a[j] = x;
                        }
                        return a;
                    };
                    this.secondsToMinutes = (time) => {
                        var mins = ~~(time / 60);
                        var secs = time % 60;
                        var hrs = ~~(time / 3600);
                        var mins = ~~((time % 3600) / 60);
                        var secs = time % 60;
                        var ret = "";
                        if (hrs > 0) {
                            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
                        }
                        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
                        ret += "" + secs;
                        return ret.split('.')[0];
                    };
                    this.resizeTrackList = () => {
                        setTimeout(() => {
                            var outer = $('.panel-body[panel-type="music-panel"]').height();
                            var inner = $('#music-panel').height();
                            var height = outer - inner - 40;
                            height = Math.max(height, 340);
                            $('.loaded_songs').css('max-height', height + "px");
                        }, 50);
                    };
                    this.loadMusicPlayerPanel = () => {
                        if (!this.loaded) {
                            this.initWaveSurfer()
                                .then(this.getMusicList)
                                .then(this.generateBindableList)
                                .then(this.loadMasterData)
                                .then(this.loadPlayer);
                        }
                    };
                    this.screenResize = (size = null) => {
                        if (this.player != null) {
                            this.player.empty();
                            this.player.drawBuffer();
                        }
                        this.resizeTrackList();
                    };
                    this.loadPlayerFromList = (data) => {
                        if (this.visibility.player != "show") {
                            this.toggleListView();
                        }
                        var list = data.all_files.map((val) => {
                            return this.master_map[val];
                        });
                        var map = {}, index;
                        for (var i = 0; i < data.all_files.length; i++) {
                            map[data.all_files[i]] = this.master_map[data.all_files[i]];
                        }
                        for (var i = 0; i < list.length; i++) {
                            index = i;
                            if (list[i].path == data.selected.replace('/music/', 'content/tracks/')) {
                                break;
                            }
                        }
                        this.song_index = index;
                        var selected = map[data.selected.replace('/music/', 'content/tracks/')];
                        this.loadPlayer({ map: map, list: list }, selected);
                        if (this.shuffle) {
                            this.generateShuffle();
                        }
                    };
                    this.track_time = {
                        total: "0:00",
                        current: "0:00"
                    };
                }
                attached() {
                    this.app_events = this.fn.mq.Subscribe((event) => {
                        if (event.target != null && event.target != 'music-player') {
                            return;
                        }
                        if (this[event.event_name] != null) {
                            this[event.event_name](event.data);
                        }
                    });
                    this.getSongMap();
                }
                detached() {
                    this.app_events.dispose();
                    if (this.player != null) {
                        this.player.destroy();
                    }
                }
                initWaveSurfer() {
                    return new Promise((res) => {
                        res({
                            player: WaveSurfer.create({
                                container: '#waveform',
                                waveColor: 'red',
                                progressColor: 'purple',
                                height: 50,
                                hideScrollbar: true,
                                barWidth: 2
                            })
                        });
                    });
                }
                closeMusicPlayer() {
                    $(".music-player-container").hide();
                }
            };
            MusicPlayer = __decorate([
                aurelia_framework_1.inject(FnTs_1.FnTs),
                __metadata("design:paramtypes", [FnTs_1.FnTs])
            ], MusicPlayer);
            exports_1("MusicPlayer", MusicPlayer);
        }
    };
});
