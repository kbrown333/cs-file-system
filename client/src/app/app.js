var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { inject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { SessionData } from './models/session';
import { FnTs } from './models/FnTs';
let App = class App {
    //APPLICATION LOAD FUNCTIONS
    constructor(router, session, fn) {
        this.router = router;
        this.session = session;
        this.fn = fn;
        this.nav = {
            show_loader: 'hide',
            show_content: 'show'
        };
        this.toggle_aside = () => {
            $(".hide-aside").toggle();
        };
        //APP EVENTS
        this.loadRoute = (route, parms = null) => {
            this.router.navigateToRoute(route, parms);
        };
        this.toggle_header = () => {
            $(".collapse").toggle();
        };
        this.displayToast = (msg) => {
            this.toast_msg = msg;
            var div = document.getElementById('snackbar');
            div.className = "show";
            setTimeout(() => { div.className = div.className = ""; }, 3000);
        };
        this.automate = (data) => {
            this.fn.mq.SendMessage({ event_name: 'receiveCommand', data: data });
        };
        this.loadVideoFiles = (data) => {
            this.loadRoute('videos', data);
        };
        this.refreshFileIndexes = () => {
            this.show_loader();
            this.fn.fn_Ajax({ url: '/api/files/index' })
                .then(() => {
                this.show_content();
            })
                .catch((err) => {
                console.log(err);
                this.show_content();
            });
        };
        this.loadRouter();
        this.loadEventListener();
        this.appLoaded();
    }
    loadRouter() {
        this.router.configure((config) => {
            config.title = "CS Tech";
            config.map([
                { route: ['', 'files'], name: 'files', moduleId: './views/files/files', nav: true, title: 'Files' },
                { route: ['videos'], name: 'videos', moduleId: './views/videos/video-player', nav: true, title: 'Videos' }
            ]);
            return config;
        });
    }
    loadEventListener() {
        this.app_events = this.fn.mq.Subscribe((event) => {
            if (event.target != null && event.target != 'app') {
                return;
            }
            if (this[event.event_name] != null) {
                this[event.event_name](event.data);
            }
        });
    }
    appLoaded() {
        this.handleResize();
    }
    clickOpenMusicPlayer() {
        $(".music-player-container").show();
        this.fn.mq.SendMessage({ event_name: 'loadMusicPlayerPanel', target: 'music-player' });
    }
    show_loader() {
        this.nav.show_loader = 'show';
        this.nav.show_content = 'hide';
    }
    show_content() {
        this.nav.show_loader = 'hide';
        this.nav.show_content = 'show';
    }
    handleResize() {
        var resizeTimeout;
        $(window).resize(() => {
            if (!!resizeTimeout) {
                resizeTimeout = null;
            }
            resizeTimeout = setTimeout(() => {
                var data = {
                    height: $(window).height(),
                    width: $(window).width()
                };
                this.fn.mq.SendMessage({ event_name: 'screenResize', data: data });
            }, 100);
        });
    }
};
App = __decorate([
    inject(Router, SessionData, FnTs),
    __metadata("design:paramtypes", [Router, SessionData, FnTs])
], App);
export { App };
