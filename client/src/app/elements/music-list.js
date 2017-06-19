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
    var aurelia_framework_1, FnTs_1, MusicList;
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
            MusicList = class MusicList {
                constructor(fn) {
                    this.fn = fn;
                    this.visibility = {
                        main: { display: 'show', header: 'Select View' },
                        songs: { display: 'hide', header: 'All Songs' },
                        artists: { display: 'hide', header: 'Artists' },
                        albums: { display: 'hide', header: 'Albums' },
                        genres: { display: 'hide', header: 'Genres' },
                        playlists: { display: 'hide', header: 'Playlists' },
                        open_playlist: { display: 'hide', header: '' },
                        loaded_songs: { display: 'hide', header: 'Songs' },
                    };
                    this.nav = { index: 0, list: null, playlist: false };
                    this.view_header = 'Select View';
                    this.master_list = [];
                    this.artists = [];
                    this.artist_index = {};
                    this.albums = [];
                    this.album_index = {};
                    this.genres = [];
                    this.genre_index = {};
                    this.playlists = [];
                    this.loaded_playlist = [];
                    this.loaded_songs = [];
                    this.selected_playlists = [];
                    this.selected_songs = [];
                    this.show_delete_playlist = 'hide';
                    this.show_delete_track = 'hide';
                    this.clickSubList = (name) => {
                        this.nav.list = name;
                        this.nav.index = 1;
                        this.toggleSubList(name);
                        if (name == 'songs') {
                            this.loaded_songs = this.master_list;
                        }
                    };
                    this.toggleSubList = (name) => {
                        if (name != null) {
                            var keys = Object.keys(this.visibility);
                            for (var i = 0; i < keys.length; i++) {
                                this.visibility[keys[i]].display = 'hide';
                            }
                            this.visibility[name].display = 'show';
                            this.view_header = this.visibility[name].header;
                            this.clearSelectedSongs();
                        }
                    };
                    this.clickBack = () => {
                        switch (this.nav.index) {
                            case 1: {
                                this.toggleSubList('main');
                                this.nav.index--;
                                break;
                            }
                            case 2: {
                                this.toggleSubList(this.nav.list);
                                this.nav.index--;
                                break;
                            }
                        }
                    };
                    this.clickForward = () => {
                        switch (this.nav.index) {
                            case 0: {
                                if (this.nav.list != null) {
                                    this.nav.index++;
                                    this.toggleSubList(this.nav.list);
                                }
                                break;
                            }
                            case 1: {
                                if (this.nav.playlist) {
                                    this.toggleSubList('open_playlist');
                                }
                                else {
                                    this.toggleSubList('loaded_songs');
                                }
                                this.nav.index++;
                                break;
                            }
                        }
                    };
                    this.loadBindableData = (data) => {
                        this.clearLists();
                        this.clearIndexes();
                        for (var i = 0; i < data.length; i++) {
                            this.loadByType(data[i], 'artist', 'artists', 'artist_index');
                            this.loadByType(data[i], 'album', 'albums', 'album_index');
                            this.loadByType(data[i], 'genre', 'genres', 'genre_index');
                        }
                        var test = this.albums;
                    };
                    this.clearLists = () => {
                        this.artists = [{ 'name': 'Unknown', 'array': [] }];
                        this.albums = [{ 'name': 'Unknown', 'array': [] }];
                        this.genres = [{ 'name': 'Unknown', 'array': [] }];
                    };
                    this.clearIndexes = () => {
                        this.artist_index = { 'unknown': 0, 'count': 1 };
                        this.album_index = { 'unknown': 0, 'count': 1 };
                        this.genre_index = { 'unknown': 0, 'count': 1 };
                    };
                    this.loadByType = (data, oi, ti, ii) => {
                        var index;
                        if (data[oi] == null || data[oi].trim() == "") {
                            index = 0;
                        }
                        else {
                            var name = data[oi].toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '');
                            if (this[ii][name] == null) {
                                index = this[ii][name] = this[ii].count;
                                this[ii].count++;
                                this[ti].push({});
                                this[ti][index]['array'] = [];
                                this[ti][index]['name'] = data[oi];
                            }
                            else {
                                index = this[ii][name];
                            }
                        }
                        this[ti][index]['array'].push(data);
                    };
                    this.loadSubGroup = (item, index) => {
                        this.nav.playlist = false;
                        this.nav.index = 2;
                        this.loaded_songs = item.array;
                        this.toggleSubList('loaded_songs');
                    };
                    this.sendListToPlayer = (item) => {
                        var path = item.path.replace('content/tracks', '/music');
                        var split = path.lastIndexOf('/') + 1;
                        var current = path.substring(0, split);
                        var file = path.substring(split);
                        var all_files = this.loaded_songs.map((val) => {
                            return val.path;
                        });
                        var data = {
                            selected: path,
                            path: current,
                            original: file,
                            all_files: all_files
                        };
                        this.fn.mq.SendMessage({ event_name: 'loadPlayerFromList', data: data });
                        this.clearSelectedSongs();
                    };
                    this.clickAddPlaylist = () => {
                        this.fn.mq.SendMessage({
                            event_name: 'showModal',
                            data: {
                                modal: 'add_playlist',
                                content: {
                                    title: 'Add Playlist',
                                    name: ''
                                },
                                reply_target: 'music-list'
                            }
                        });
                    };
                    this.addPlaylist = (name) => {
                        var req = {
                            url: '/api/music/playlists',
                            type: 'POST',
                            data: { playlist: name }
                        };
                        this.fn.fn_Ajax(req)
                            .then((data) => {
                            this.playlists.push({ name: name, tracks: [] });
                        });
                    };
                    this.selectPlaylist = (index) => {
                        this.loaded_playlist = this.playlists[index].tracks;
                        this.visibility.open_playlist.header = this.playlists[index].name;
                        this.loaded_songs = this.playlists[index].tracks;
                        this.nav.index = 2;
                        this.nav.playlist = true;
                        this.toggleSubList('open_playlist');
                    };
                    this.clickAddTrackToPlaylist = (track) => {
                        if (this.selected_songs.length > 0) {
                            $("li", ".mdl-select-playlist").removeClass('mdl-playlist-selected');
                            this.fn.mq.SendMessage({
                                event_name: 'showModal',
                                data: {
                                    modal: 'select_playlist',
                                    content: {
                                        title: 'Add Track to Playlist',
                                        playlists: this.playlists,
                                        selected: null
                                    },
                                    reply_target: 'music-list'
                                }
                            });
                        }
                    };
                    this.addTrackToPlaylist = (name) => {
                        if (name != null && name.trim() != "") {
                            var songs = this.selected_songs.map((val) => {
                                return {
                                    title: val.title,
                                    year: val.year,
                                    genre: val.genre,
                                    path: val.path,
                                    track: val.track,
                                    artist: val.artist
                                };
                            });
                            var req = {
                                url: '/api/music/playlists/insert',
                                type: 'POST',
                                data: { info: JSON.stringify({ name: name, songs: songs }) }
                            };
                            this.fn.fn_Ajax(req)
                                .then(this.updatePlaylistTracks)
                                .catch((err) => { console.log(err); });
                        }
                    };
                    this.updatePlaylistTracks = (data) => {
                        var index = -1;
                        this.playlists.filter((val, i) => {
                            if (val.name == data.name) {
                                index = i;
                                return true;
                            }
                        });
                        this.playlists[index].tracks = data.tracks;
                        this.loaded_playlist = data.tracks;
                        $("li").removeClass('selected_track');
                    };
                    this.clickDeleteTrackFromPlaylist = () => {
                        if (this.selected_songs.length > 0) {
                            var map = {};
                            for (var i = 0; i < this.selected_songs.length; i++) {
                                map[this.selected_songs[i].path] = true;
                            }
                            var name = this.visibility.open_playlist.header;
                            var req = {
                                url: '/api/music/playlists/remove',
                                type: 'POST',
                                data: { info: JSON.stringify({ map: map, name: name }) }
                            };
                            this.fn.fn_Ajax(req)
                                .then(this.updatePlaylistTracks)
                                .catch((err) => { console.log(err); });
                        }
                    };
                    this.clickDeletePlaylist = () => {
                        if (this.selected_playlists.length > 0) {
                            var map = {};
                            for (var i = 0; i < this.selected_playlists.length; i++) {
                                map[this.selected_playlists[i].name] = true;
                            }
                            var req = {
                                url: '/api/music/playlists/delete',
                                type: 'POST',
                                data: { info: JSON.stringify({ map: map }) }
                            };
                            this.fn.fn_Ajax(req)
                                .then(this.updatePaylists)
                                .catch((err) => { console.log(err); });
                        }
                    };
                    this.updatePaylists = (data) => {
                        this.playlists = data;
                    };
                    this.clickPlaylist = (data) => {
                        var elem = $(data.elem.parentElement);
                        var selected = elem.hasClass('selected_track');
                        if (selected) {
                            elem.removeClass('selected_track');
                            this.selected_playlists = this.selected_playlists.filter((val) => {
                                return val.name != data.data.name;
                            });
                        }
                        else {
                            elem.addClass('selected_track');
                            this.selected_playlists.push(data.data);
                        }
                        this.toggleDeleteButtons();
                    };
                    this.clickTrack = (data) => {
                        var elem = $(data.elem.parentElement);
                        var selected = elem.hasClass('selected_track');
                        if (selected) {
                            elem.removeClass('selected_track');
                            this.selected_songs = this.selected_songs.filter((val) => {
                                return val.path != data.data.path;
                            });
                        }
                        else {
                            elem.addClass('selected_track');
                            this.selected_songs.push(data.data);
                        }
                        this.toggleDeleteButtons();
                    };
                    this.clearSelectedSongs = () => {
                        $("li").removeClass('selected_track');
                        this.selected_songs = [];
                        this.toggleDeleteButtons();
                    };
                    this.toggleDeleteButtons = () => {
                        if (this.selected_songs.length > 0) {
                            this.show_delete_track = 'show';
                        }
                        else {
                            this.show_delete_track = 'hide';
                        }
                        if (this.selected_playlists.length > 0) {
                            this.show_delete_playlist = 'show';
                        }
                        else {
                            this.show_delete_playlist = 'hide';
                        }
                    };
                    this.screenResize = (size = null) => {
                        this.resizeCategoryLists();
                    };
                    this.resizeCategoryLists = () => {
                        setTimeout(() => {
                            var height = $(window).height() - 150;
                            $('.category-list').css('max-height', height + "px");
                            $('.playlist-data').css('max-height', (height - 40) + "px");
                            $('.song-list').css('max-height', (height - 40) + "px");
                        }, 50);
                    };
                    this.onModalClose = (data) => {
                        switch (data.modal) {
                            case 'add_playlist':
                                this.addPlaylist(data.content.name);
                                break;
                            case 'select_playlist':
                                this.addTrackToPlaylist(data.content.selected);
                                break;
                        }
                    };
                    this.fn.fn_Ajax({ url: '/api/music/playlists' })
                        .then((data) => {
                        this.playlists = data;
                    });
                }
                attached() {
                    this.app_events = this.fn.mq.Subscribe((event) => {
                        if (event.target != null && event.target != 'music-list') {
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
                grid_dataChanged(newVal, oldVal) {
                    if (newVal != null) {
                        this.master_list = newVal;
                        this.loadBindableData(newVal);
                    }
                }
            };
            MusicList = __decorate([
                aurelia_framework_1.bindable({ name: 'grid_data', defaultValue: [], defaultBindingMode: aurelia_framework_1.bindingMode.twoWay }),
                aurelia_framework_1.inject(FnTs_1.FnTs),
                __metadata("design:paramtypes", [FnTs_1.FnTs])
            ], MusicList);
            exports_1("MusicList", MusicList);
        }
    };
});
