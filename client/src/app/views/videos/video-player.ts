import {inject} from 'aurelia-framework';
import {FnTs} from '../../models/FnTs';

@inject(FnTs)
export class VideoPlayer {

	app_events: any;
	videos: any = [];
	now_playing: string = '';
	index: number = -1;
	manual_load: boolean = false;
	manual_data: any;

	constructor(private fn: FnTs) {
	}

	attached() {
		this.app_events = this.fn.ea.subscribe('react', (event: any) => {
			if (this[event.event_name] != null) { this[event.event_name](event.data); }
		});
		this.screenResize();
		if (this.manual_load) {
			this.getVideoList(this.manual_data);
		} else {
			this.getVideoList();
		}
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
					this.index = 0;
					this.loadVideoPlayer(rslt[0], true);
				}
			});
	}

	loadVideoPlayer = (data: any, no_start: boolean = false) => {
		this.changeVideo(data.path, no_start);
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
			this.loadVideoPlayer(video_files[index], true);
		}
	}

	changeVideo = (link: string, no_start: boolean = false) => {
		var player = <HTMLVideoElement>document.getElementById('vid_player');
		var video = <HTMLVideoElement>document.getElementById('vid_src');
		player.pause();
		video.src = link;
		player.load();
		if (!no_start) player.play();
		document.getElementById('vid_player').addEventListener('ended', () => {
			setTimeout(() => { this.next(); }, 5000);
		}, false);
	}

	next = () => {
		if (this.index > -1 && this.index < this.videos.length - 1) {
			this.loadVideoPlayer(this.videos[++this.index]);
		}
	}
	prev = () => {
		if (this.index > 0) {
			this.loadVideoPlayer(this.videos[--this.index]);
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
