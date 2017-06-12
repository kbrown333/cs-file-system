import {inject, bindable, bindingMode} from 'aurelia-framework';
import {FnTs} from '../models/FnTs';

@bindable({name: 'grid_data', defaultValue: [], defaultBindingMode: bindingMode.twoWay})
@inject(FnTs)
export class MusicList {

	app_events: any;
	visibility: any = {
		main: {display: 'show', header: 'Select View'},
		songs: {display: 'hide', header: 'All Songs'},
		artists: {display: 'hide', header: 'Artists'},
		albums: {display: 'hide', header: 'Albums'},
		genres: {display: 'hide', header: 'Genres'},
		playlists: {display: 'hide', header: 'Playlists'},
		open_playlist: {display: 'hide', header: ''},
		loaded_songs: {display: 'hide', header: 'Songs'},
	};
	nav: any = {index: 0, list: null, playlist: false};
	view_header: string = 'Select View';
	grid_data: any;
	master_list: any = [];
	artists: any = [];
	artist_index: any = {};
	albums: any = [];
	album_index: any = {};
	genres: any = [];
	genre_index: any = {};
	playlists: any = [];
	loaded_playlist: any = [];
	loaded_songs: any = [];
	selected_playlists: any = [];
	selected_songs: any = [];
	show_delete_playlist: string = 'hide';
	show_delete_track: string = 'hide';

	constructor(private fn: FnTs) {
		this.fn.fn_Ajax({ url: '/api/music/playlists' })
			.then((data) => {
				this.playlists = data;
			});
	}

	attached() {
		this.app_events = this.fn.mq.Subscribe((event: any) => {
			if (this[event.event_name] != null) { this[event.event_name](event.data); }
		});
	}

	detached() {
		this.app_events.dispose();
	}

	grid_dataChanged(newVal: any, oldVal: any) {
		if (newVal != null) {
			this.master_list = newVal;
			this.loadBindableData(newVal);
		}
	}

	clickSubList = (name: string) => {
		this.nav.list = name;
		this.nav.index = 1;
		this.toggleSubList(name);
		if (name == 'songs') { this.loaded_songs = this.master_list; }
	}

	toggleSubList = (name: string) => {
		if (name != null) {
			var keys = Object.keys(this.visibility);
			for (var i = 0; i < keys.length; i++) {
				this.visibility[keys[i]].display = 'hide';
			}
			this.visibility[name].display = 'show';
			this.view_header = this.visibility[name].header;
			this.clearSelectedSongs();
		}
	}

	clickBack = () => {
		switch(this.nav.index) {
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
	}

	clickForward = () => {
		switch(this.nav.index) {
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
				} else {
					this.toggleSubList('loaded_songs');
				}
				this.nav.index++;
				break;
			}
		}
	}

	loadBindableData = (data: any) => {
		this.clearLists();
		this.clearIndexes();
		for (var i = 0; i < data.length; i++) {
			this.loadByType(data[i], 'artist', 'artists', 'artist_index');
			this.loadByType(data[i], 'album', 'albums', 'album_index');
			this.loadByType(data[i], 'genre', 'genres', 'genre_index');
		}
		var test = this.albums;
	}

	clearLists = () => {
		this.artists = [{'name': 'Unknown', 'array': []}];
		this.albums =[{'name': 'Unknown', 'array': []}];
		this.genres = [{'name': 'Unknown', 'array': []}];
	}

	clearIndexes = () => {
		this.artist_index = {'unknown': 0, 'count': 1};
		this.album_index = {'unknown': 0, 'count': 1};
		this.genre_index = {'unknown': 0, 'count': 1};
	}

	loadByType = (data: any, oi: string, ti: string, ii: string) => {
		var index;
		if (data[oi] == null || data[oi].trim() == "") {
			index = 0;
		} else {
			var name = data[oi];
			if (this[ii][data[oi]] == null) {
				index = this[ii][data[oi]] = this[ii].count;
				this[ii].count++;
				this[ti].push({});
				this[ti][index]['array'] = [];
				this[ti][index]['name'] = name;
			} else {
				index = this[ii][data[oi]];
			}
		}
		this[ti][index]['array'].push(data);
	}

	loadSubGroup = (item: any, index: number) => {
		this.nav.playlist = false;
		this.nav.index = 2;
		this.loaded_songs = item.array;
		this.toggleSubList('loaded_songs');
	}

	sendListToPlayer = (item: any) => {
		var path = item.path.replace('content/tracks', '/music');
		var split = path.lastIndexOf('/') + 1;
		var current = path.substring(0, split);
		var file = path.substring(split);
		var all_files = this.loaded_songs.map((val) => {
			return val.path;
		})
		var data = {
			selected: path,
			path: current,
			original: file,
			all_files: all_files
		};
		this.fn.mq.SendMessage({event_name: 'loadPlayerFromList', data: data});
		this.clearSelectedSongs();
	}

	clickAddPlaylist = () => {
		this.fn.mq.SendMessage({
			event_name: 'showModal',
			data: {
				modal: 'add_playlist',
				content: {
					title: 'Add Playlist',
					name: ''
				}
			}
		});
	}

	addPlaylist = (name: any) => {
		var req = {
			url: '/api/music/playlists',
			type: 'POST',
			data: {playlist: name}
		}
		this.fn.fn_Ajax(req)
			.then((data) => {
				this.playlists.push({name: name, tracks: []})
			});
	}

	selectPlaylist = (index: number) => {
		this.loaded_playlist = this.playlists[index].tracks;
		this.visibility.open_playlist.header = this.playlists[index].name;
		this.loaded_songs = this.playlists[index].tracks;
		this.nav.index = 2;
		this.nav.playlist = true;
		this.toggleSubList('open_playlist');
	}

	clickAddTrackToPlaylist = (track: any) => {
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
					}
				}
			});
		}
	}

	addTrackToPlaylist = (name: any) => {
		if (name != null && name.trim() != "") {
			var songs = this.selected_songs.map((val) => {
				return {
					title: val.title,
					year: val.year,
					genre: val.genre,
					path: val.path,
					track: val.track,
					artist: val.artist
				}
			});
			var req = {
				url: '/api/music/playlists/insert',
				type: 'POST',
				data: {info: JSON.stringify({name: name, songs: songs})}
			}
			this.fn.fn_Ajax(req)
				.then(this.updatePlaylistTracks)
				.catch((err) => { console.log(err); });
		}
	}

	updatePlaylistTracks = (data: any) => {
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
	}

	clickDeleteTrackFromPlaylist = () => {
		if (this.selected_songs.length > 0) {
			var map = {};
			for (var i = 0; i < this.selected_songs.length; i++) {
				map[this.selected_songs[i].path] = true;
			}
			var name = this.visibility.open_playlist.header;
			var req = {
				url: '/api/music/playlists/remove',
				type: 'POST',
				data: {info: JSON.stringify({map: map, name: name})}
			}
			this.fn.fn_Ajax(req)
				.then(this.updatePlaylistTracks)
				.catch((err) => { console.log(err); });
		}
	}

	clickDeletePlaylist = () => {
		if (this.selected_playlists.length > 0) {
			var map = {};
			for (var i = 0; i < this.selected_playlists.length; i++) {
				map[this.selected_playlists[i].name] = true;
			}
			var req = {
				url: '/api/music/playlists/delete',
				type: 'POST',
				data: {info: JSON.stringify({map: map})}
			}
			this.fn.fn_Ajax(req)
				.then(this.updatePaylists)
				.catch((err) => { console.log(err); });
		}
	}

	updatePaylists = (data: any) => {
		this.playlists = data;
	}

	clickPlaylist = (data: any) => {
		var elem = $(data.elem.parentElement);
		var selected = elem.hasClass('selected_track');
		if (selected) {
			elem.removeClass('selected_track');
			this.selected_playlists = this.selected_playlists.filter((val) => {
				return val.name != data.data.name;
			});
		} else {
			elem.addClass('selected_track');
			this.selected_playlists.push(data.data);
		}
		this.toggleDeleteButtons();
	}

	clickTrack = (data: any) => {
		var elem = $(data.elem.parentElement);
		var selected = elem.hasClass('selected_track');
		if (selected) {
			elem.removeClass('selected_track');
			this.selected_songs = this.selected_songs.filter((val) => {
				return val.path != data.data.path;
			});
		} else {
			elem.addClass('selected_track');
			this.selected_songs.push(data.data);
		}
		this.toggleDeleteButtons();
	}

	clearSelectedSongs = () => {
		$("li").removeClass('selected_track');
		this.selected_songs = [];
		this.toggleDeleteButtons();
	}

	toggleDeleteButtons = () => {
		if (this.selected_songs.length > 0) {
			this.show_delete_track = 'show';
		} else {
			this.show_delete_track = 'hide';
		}
		if (this.selected_playlists.length > 0) {
			this.show_delete_playlist = 'show';
		} else {
			this.show_delete_playlist = 'hide';
		}
	}

	//Event Aggregator Functions
	screenResize = (size: any = null): void => {
		this.resizeCategoryLists();
	}

	resizeCategoryLists = () => {
		setTimeout(() => {
			var outer = $('.panel-body[panel-type="music-panel"]').height();
			var inner = $('.list-view-header').height();
			var height = outer - inner - 20;
			height = Math.max(height, 150);
			$('.category-list').css('max-height', height + "px");
			$('.playlist-data').css('max-height', (height - 40) + "px");
			$('.song-list').css('max-height', (height - 40) + "px");
		}, 50);
	}

	onModalClose = (data: any) => {
		switch (data.modal) {
			case 'add_playlist':
				this.addPlaylist(data.content.name);
				break;
			case 'select_playlist':
				this.addTrackToPlaylist(data.content.selected);
				break;
		}
	}

}
