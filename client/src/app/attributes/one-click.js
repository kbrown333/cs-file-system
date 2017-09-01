var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { bindable, inject } from 'aurelia-framework';
import { FnTs } from '../models/FnTs';
let OneClickCustomAttribute = class OneClickCustomAttribute {
    constructor(element, fn) {
        this.element = element;
        this.fn = fn;
        $(element).click((event) => {
            if (this.that) {
                this.fn.mq.SendMessage({ event_name: this.event, data: { data: this.data, elem: this.element } });
            }
            else {
                this.fn.mq.SendMessage({ event_name: this.event, data: this.data });
            }
        });
    }
    eventChanged(newValue, oldValue) {
        var x = 1;
    }
    dataChanged(newValue, oldValue) {
        var x = 1;
    }
};
__decorate([
    bindable,
    __metadata("design:type", String)
], OneClickCustomAttribute.prototype, "event", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], OneClickCustomAttribute.prototype, "data", void 0);
__decorate([
    bindable,
    __metadata("design:type", Boolean)
], OneClickCustomAttribute.prototype, "that", void 0);
OneClickCustomAttribute = __decorate([
    inject(Element, FnTs),
    __metadata("design:paramtypes", [Element, FnTs])
], OneClickCustomAttribute);
export { OneClickCustomAttribute };
