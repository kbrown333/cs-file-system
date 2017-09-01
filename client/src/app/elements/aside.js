var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { inject } from 'aurelia-framework';
import { FnTs } from '../models/FnTs';
let Aside = class Aside {
    constructor(fn) {
        this.fn = fn;
        this.refreshIndex = () => {
            this.hideMe();
            this.fn.mq.SendMessage({ event_name: 'refreshFileIndexes', target: 'app' });
        };
        this.refreshMusic = () => {
            this.hideMe();
            this.fn.fn_Ajax({ url: '/api/music/map?nocache=true' })
                .then((rslt) => {
                this.fn.mq.SendMessage({ event_name: 'reloadMusicPanel', target: 'music-player', data: rslt });
            });
        };
    }
    attached() {
        this.app_events = this.fn.mq.Subscribe((event) => {
            if (event.target != null && event.target != 'music-player') {
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
    hideMe() {
        $(".hide-aside").toggle();
    }
};
Aside = __decorate([
    inject(FnTs),
    __metadata("design:paramtypes", [FnTs])
], Aside);
export { Aside };
