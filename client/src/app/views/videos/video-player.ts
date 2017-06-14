import {inject} from 'aurelia-framework';
import {FnTs} from '../../models/FnTs';

@inject(FnTs)
export class VideoPlayer {

	app_events: any;
	videos: any = [];
	now_playing: string = '';
	index: number = -1;

	constructor(private fn: FnTs) {
	}

	attached() {
		this.app_events = this.fn.ea.subscribe('react', (event: any) => {
			if (this[event.event_name] != null) { this[event.event_name](event.data); }
		});
		this.getVideoList();
		this.screenResize();
	}

	detached() {
		this.app_events.dispose();
	}

	getVideoList(): void {
		this.fn.fn_Ajax({url: '/api/videos/mp4'})
			.then((rslt) => {
				this.videos = rslt;
				if (rslt.length > 0) {
					var player = <HTMLVideoElement>document.getElementById('vid_player');
					var video = <HTMLVideoElement>document.getElementById('vid_src');
					video.src = rslt[0].path;
					this.now_playing = rslt[0].name;
					player.load();
					this.index = 0;
				}
			});
	}

	loadVideoFile = (data: any) => {
		this.changeVideo(data.path);
		this.now_playing = data.name;
	}

	changeVideo = (link: string) => {
		var player = <HTMLVideoElement>document.getElementById('vid_player');
		var video = <HTMLVideoElement>document.getElementById('vid_src');
		player.pause();
		video.src = link;
		player.load();
		player.play();
		document.getElementById('vid_player').addEventListener('ended', () => {
			setTimeout(() => { this.next(); }, 5000);
		}, false);
	}

	next = () => {
		if (this.index > -1 && this.index < this.videos.length - 1) {
			this.loadVideoFile(this.videos[++this.index]);
		}
	}
	prev = () => {
		if (this.index > 0) {
			this.loadVideoFile(this.videos[--this.index]);
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
