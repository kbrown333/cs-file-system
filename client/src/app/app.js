System.register(["aurelia-framework", "aurelia-router", "./models/session", "./models/FnTs"], function (exports_1, context_1) {
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
    var aurelia_framework_1, aurelia_router_1, session_1, FnTs_1, App;
    return {
        setters: [
            function (aurelia_framework_1_1) {
                aurelia_framework_1 = aurelia_framework_1_1;
            },
            function (aurelia_router_1_1) {
                aurelia_router_1 = aurelia_router_1_1;
            },
            function (session_1_1) {
                session_1 = session_1_1;
            },
            function (FnTs_1_1) {
                FnTs_1 = FnTs_1_1;
            }
        ],
        execute: function () {
            App = class App {
                constructor(router, session, fn) {
                    this.router = router;
                    this.session = session;
                    this.fn = fn;
                    this.loadRoute = (route, parms = null) => {
                        this.router.navigateToRoute(route, parms);
                    };
                    this.toggle_header = () => {
                        $(".collapse").toggle();
                    };
                    this.toggle_aside = () => {
                        this.session.visibility.aside = 'stage';
                        setTimeout(() => {
                            this.session.visibility.aside = 'slide';
                        }, 10);
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
                aurelia_framework_1.inject(aurelia_router_1.Router, session_1.SessionData, FnTs_1.FnTs),
                __metadata("design:paramtypes", [aurelia_router_1.Router, session_1.SessionData, FnTs_1.FnTs])
            ], App);
            exports_1("App", App);
        }
    };
});
