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
	private vid_finished: boolean = false;

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
		if (parms != null && parms.all_files != null) {
			this.manual_load = true;
			this.manual_data = parms;
		}
	}

	getVideoList(data: any = null): void {
		this.fn.fn_Ajax({url: '/api/videos/mp4'})
			.then((rslt) => {
				if (rslt.length <= 0) return;
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
	}
	prev = () => {
		if (this.index > 0) {
			this.loadVideoPlayer(this.visible_videos[--this.index]);
		}
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

}
