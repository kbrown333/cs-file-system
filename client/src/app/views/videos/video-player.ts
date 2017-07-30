import {inject} from 'aurelia-framework';
import {FnTs} from '../../models/FnTs';

@inject(FnTs)
export class VideoPlayer {

	app_events: any;
	videos: any = [];
	visible_videos: any = [];
	now_playing: string = '';
	index: number = -1;
	manual_load: boolean = false;
	manual_data: any;
	visibility: any = {
		videos: 'show',
		list: 'hide'
	}
	shuffle_single: boolean = false;
	shuffle_passes: number = 3;
	private vid_finished: boolean = false;
	private shuffle_mode: boolean = false;
	private shuffle_name: string = '';

	constructor(private fn: FnTs) {
	}

	attached() {
		this.app_events = this.fn.ea.subscribe('react', (event: any) => {
			if (this[event.event_name] != null) { this[event.event_name](event.data); }
		});
		this.screenResize();
		document.getElementById('vid_player').addEventListener('ended', () => {
			this.vid_finished = true;
			setTimeout(() => { this.next(); }, 5000);
		}, false);
		if (this.manual_load) {
			this.getVideoList(this.manual_data);
		} else {
			this.getVideoList();
		}
		$("input", ".srch-video-box").keyup(this.searchVideos);
		$("input", ".srch-video-box").focusout(() => { this.searchVideos({}, true) });
	}

	detached() {
		this.app_events.dispose();
	}

	activate(parms:any = null) {
		if (parms != null) {
			if (parms.all_files != null) {
				this.manual_load = true;
				this.manual_data = parms;
			} else if (parms.shuffle != null) {
				this.shuffle_mode = true;
				this.shuffle_name = parms.shuffle;
			}
		}
	}

	toggleListView = () => {
		if (this.visibility.videos == 'show') {
			this.visibility.videos = 'hide';
			this.visibility.list = 'show';
			this.fn.mq.SendMessage({ event_name: 'resizeCategoryLists', target: 'video-list' });
			$('#btn-vid-list-view').addClass('list-view-selected');
		} else {
			this.visibility.videos = 'show';
			this.visibility.list = 'hide';
			$('#btn-vid-list-view').removeClass('list-view-selected');
		}
	}

	getVideoList(data: any = null): void {
		this.fn.fn_Ajax({url: '/api/videos/mp4'})
			.then((rslt) => {
				if (rslt.length <= 0) return;
				if (data != null) {
					this.videos = rslt;
					this.loadVideosFromList(rslt, data);
				} else if (this.shuffle_mode) {
					this.videos = rslt;
					this.loadFromShuffleHistory();
				} else {
					this.videos = rslt;
					this.visible_videos = $.extend(true, [], rslt);
					this.index = 0;
					this.loadVideoPlayer(rslt[0], true);
				}
			});
	}

	loadVideoPlayer = (data: any, no_start: boolean = false, index: number = null) => {
		this.changeVideo(data.path, no_start);
		if (index != null) this.index = index;
		this.now_playing = data.name;
	}

	loadVideosFromList = (all_videos: any, data: any) => {
		var map = {};
		for (var i = 0; i < all_videos.length; i++) {
			map[all_videos[i].path] = true;
		}
		$("input", ".srch-video-box").val(data.path);
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
			//this.videos = video_files;
			this.visible_videos = $.extend(true, [], video_files);
			this.loadVideoPlayer(video_files[index], false);
		}
	}

	loadFromShuffleHistory = () => {
		var shuffle_str = localStorage[this.shuffle_name];
		if (shuffle_str == null) { return; }
		var shuffle = JSON.parse(shuffle_str);
		this.visible_videos = shuffle.videos;
		this.index = shuffle.index;
		this.next();
	}

	changeVideo = (link: string, no_start: boolean = false) => {
		var player = <HTMLVideoElement>document.getElementById('vid_player');
		var video = <HTMLVideoElement>document.getElementById('vid_src');
		if (!this.vid_finished)	player.pause();
		else this.vid_finished = false;
		video.src = link;
		player.load();
		if (!no_start) player.play();
	}

	next = () => {
		if (this.index > -1 && this.index < this.visible_videos.length - 1) {
			this.loadVideoPlayer(this.visible_videos[++this.index]);
		}
		if (this.shuffle_mode) { this.updateShuffleHistory(); }
	}
	prev = () => {
		if (this.index > 0) {
			this.loadVideoPlayer(this.visible_videos[--this.index]);
		}
		if (this.shuffle_mode) { this.updateShuffleHistory(); }
	}

	updateShuffleHistory = () => {
		var shuffle_str = localStorage[this.shuffle_name];
		if (shuffle_str == null) { return; }
		var shuffle = JSON.parse(shuffle_str);
		shuffle.index = this.index;
		localStorage[this.shuffle_name] = JSON.stringify(shuffle);
	}

	toggleSearchBox = (): void => {
		$('.panel-body[panel-type="video-list"]').toggleClass('searching');
	}

	searchVideos = (event: any, force: boolean = false) => {
		if (event.which == 13 || force) {
			var val = $("input", ".srch-video-box").val().trim();
			if (val == "") {
				this.visible_videos = $.extend(true, [], this.videos);
			} else {
				this.visible_videos = this.videos.filter((vid) => {
					return vid.path.toLowerCase().indexOf(val.toLowerCase()) != -1;
				});
			}
		}
	}

	filterByGroups = (queries: any, videos: any) => {
		var selected_vids = [], q;
		var max = -1, max_index = 0;
		for (var i = 0; i < queries.length; i++) {
			q = queries[i].toLowerCase();
			for (var j = 0; j < videos.length; j++) {
				if (videos[j].path.toLowerCase().indexOf(q) != -1) {
					if (selected_vids[i] == null) selected_vids.push([]);
					selected_vids[i].push(videos[j]);
				}
			}
			for (var j = 0; j < this.shuffle_passes; j++) {
				selected_vids[i] = this.randomShuffle(selected_vids[i]);
			}
			if (max < selected_vids[i].length) {
				max = selected_vids[i].length;
				max_index = i;
			}
		}
		for (var i = 0; i < this.shuffle_passes; i++) {
			selected_vids = this.randomShuffle(selected_vids);
		}
		return {
			groups: selected_vids,
			max: max,
			max_index: max_index
		};
	}

	generateShuffle = (selected_vids: any): any => {
		var list = [];
		var x = 0;
		for (var i = 0; i < selected_vids.max; i++) {
			for (var j = 0; j < selected_vids.groups.length; j++) {
				if (i < selected_vids.groups[j].length) {
					list.push(selected_vids.groups[j][i]);
				}
			}
		}
		return list;
	}

	randomShuffle = (a: any): any => {
		var j, x, i;
	    for (i = a.length; i; i--) {
	        j = Math.floor(Math.random() * i);
	        x = a[i - 1];
	        a[i - 1] = a[j];
	        a[j] = x;
	    }
		return a;
	}

	//Event Aggregator Functions
	screenResize = (size: any = null): void => {
		var height, width;
		if (size == null) { height = $(window).height(); width = $(window).width(); }
		else { height = size.height; width = size.width; }
		var offset = width > 768 ? 150 : 190;
		height = height - offset;
		$('.panel-body[panel-type="video-panel"]').css('height', height + 'px');
		$('.panel-body[panel-type="video-list"]').css('height', height + 'px');
	}

	loadVideoGroup = (data: any) => {
		var vids = $.extend(true, [], this.videos);
		this.shuffle_mode = true;
		this.shuffle_name = data.name;
		var selected_vids = this.filterByGroups(data.filter_groups, vids);
		var shuffle = this.generateShuffle(selected_vids);
		this.visible_videos = shuffle;
		localStorage[data.name] = JSON.stringify({
			index: 0,
			videos: shuffle
		});
		history.replaceState(undefined, undefined, '#/videos?shuffle=' + data.name.replace(/ /g, '%20'))
		this.loadVideoPlayer(shuffle[0], false, 0);
		this.toggleListView();
	}

	reloadVideoGroup = (name: any) => {
		this.shuffle_mode = true;
		this.shuffle_name = name;
		history.replaceState(undefined, undefined, '#/videos?shuffle=' + name.replace(/ /g, '%20'))
		this.loadFromShuffleHistory();
		this.toggleListView();
	}

}
