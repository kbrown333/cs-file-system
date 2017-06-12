import {inject} from "aurelia-framework";
import {Router, RouterConfiguration} from "aurelia-router";
import {SessionData} from './models/session';
import {FnTs} from './models/FnTs';
import {AggregateData} from './models/message_queue';

@inject(Router, SessionData, FnTs)
export class App {

    app_events: any;

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
                { route: ['', 'files'], name: 'files', moduleId: './views/files/files', nav: true, title: 'Files' }
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
    }

    //APP EVENTS
    toggle_header = () => {
        $(".collapse").toggle();
    }

    toggle_aside = () => {
        this.session.visibility.aside = 'stage';
        setTimeout(() => {
            this.session.visibility.aside = 'slide';
        }, 10);
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
}
