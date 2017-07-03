import {inject} from "aurelia-framework";
import {Router, RouterConfiguration} from "aurelia-router";
import {SessionData} from './models/session';
import {FnTs} from './models/FnTs';
import {AggregateData} from './models/message_queue';

@inject(Router, SessionData, FnTs)
export class App {

    app_events: any;
    nav: any = {
        show_loader: 'hide',
        show_content: 'show'
    }

    //APPLICATION LOAD FUNCTIONS
    constructor(private router: Router, private session: SessionData, private fn: FnTs) {
        this.loadRouter();
        this.loadEventListener();
        this.appLoaded();
    }

    private loadRouter() {
        this.router.configure((config: RouterConfiguration): RouterConfiguration => {
            config.title = "CS Tech";
            config.map([
                { route: ['', 'files'], name: 'files', moduleId: './views/files/files', nav: true, title: 'Files' },
                { route: ['videos'], name: 'videos', moduleId: './views/videos/video-player', nav: true, title: 'Videos' }
            ]);
            return config;
        });
    }

    loadEventListener() {
		this.app_events = this.fn.mq.Subscribe((event: AggregateData) => {
            if (event.target != null && event.target != 'app') { return; }
            if (this[event.event_name] != null) { this[event.event_name](event.data); }
        });
    }

    private appLoaded() {
        this.handleResize();
    }

    clickOpenMusicPlayer() {
        $(".music-player-container").show();
        this.fn.mq.SendMessage({event_name: 'loadMusicPlayerPanel', target: 'music-player'});
    }

	show_loader() {
		this.nav.show_loader = 'show';
		this.nav.show_content = 'hide';
	}

	show_content() {
		this.nav.show_loader = 'hide';
		this.nav.show_content = 'show';
	}

    toggle_aside = () => {
        $(".hide-aside").toggle();
    }

    //APP EVENTS
    loadRoute = (route: string, parms: any = null) => {
        this.router.navigateToRoute(route, parms);
    }

    toggle_header = () => {
        $(".collapse").toggle();
    }

    private handleResize(): void {
        var resizeTimeout;
        $(window).resize(() => {
            if (!!resizeTimeout) { resizeTimeout = null; }
            resizeTimeout = setTimeout(() => {
                var data = {
                    height: $(window).height(),
                    width: $(window).width()
                };
                this.fn.mq.SendMessage({event_name: 'screenResize', data: data});
            }, 100);
        });
    }

    toast_msg: string;
    displayToast = (msg: any) => {
        this.toast_msg = msg;
        var div = document.getElementById('snackbar');
        div.className = "show";
        setTimeout(() => { div.className = div.className = ""; }, 3000);
    }

    automate = (data: any) => {
        this.fn.mq.SendMessage({event_name: 'receiveCommand', data: data})
    }

    loadVideoFiles = (data: any) => {
		this.loadRoute('videos', data);
	}

    refreshFileIndexes = () => {
        this.show_loader();
        this.fn.fn_Ajax({url: '/api/files/index'})
            .then(() => {
                this.show_content();
            })
            .catch((err) => {
                console.log(err);
                this.show_content();
            });
    }
}
