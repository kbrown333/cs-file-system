System.register(["aurelia-framework", "../models/FnTs"], function (exports_1, context_1) {
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
    var aurelia_framework_1, FnTs_1, DblClickCustomAttribute;
    return {
        setters: [
            function (aurelia_framework_1_1) {
                aurelia_framework_1 = aurelia_framework_1_1;
            },
            function (FnTs_1_1) {
                FnTs_1 = FnTs_1_1;
            }
        ],
        execute: function () {
            DblClickCustomAttribute = class DblClickCustomAttribute {
                constructor(element, fn) {
                    this.element = element;
                    this.fn = fn;
                    $(element).dblclick((event) => {
                        this.fn.mq.SendMessage({ event_name: this.event, data: this.data });
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
                aurelia_framework_1.bindable,
                __metadata("design:type", String)
            ], DblClickCustomAttribute.prototype, "event", void 0);
            __decorate([
                aurelia_framework_1.bindable,
                __metadata("design:type", Object)
            ], DblClickCustomAttribute.prototype, "data", void 0);
            DblClickCustomAttribute = __decorate([
                aurelia_framework_1.inject(Element, FnTs_1.FnTs),
                __metadata("design:paramtypes", [Element, FnTs_1.FnTs])
            ], DblClickCustomAttribute);
            exports_1("DblClickCustomAttribute", DblClickCustomAttribute);
        }
    };
});
