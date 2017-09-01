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
let ToggleMeCustomAttribute = class ToggleMeCustomAttribute {
    constructor(element) {
        this.element = element;
    }
    valueChanged(newValue, oldValue) {
        //available values are 'hide', 'remove', 'show', or any css 'display' value
        this.changeDisplayState(newValue);
    }
    changeDisplayState(state) {
        if (state == "hide") {
            $(this.element).hide();
        }
        else if (state == "remove") {
            $(this.element).remove();
        }
        else if (state == "show") {
            $(this.element).show();
        }
        else if (state == "slide") {
            $(this.element).toggle('slide');
        }
        else if (state == "stage") {
        }
        else {
            $(this.element).css('display', 'inline-block');
        }
    }
};
ToggleMeCustomAttribute = __decorate([
    inject(Element),
    __metadata("design:paramtypes", [Element])
], ToggleMeCustomAttribute);
export { ToggleMeCustomAttribute };
