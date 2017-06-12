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
    var aurelia_framework_1, FnTs_1, CpkModal;
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
            CpkModal = class CpkModal {
                constructor(fn) {
                    this.fn = fn;
                    this.guid = this.generateGUID();
                }
                attached() {
                    this.app_events = this.fn.mq.Subscribe((event) => {
                        if (this[event.event_name] != null) {
                            this[event.event_name](event.data);
                        }
                    });
                }
                detached() {
                    this.app_events.dispose();
                }
                generateGUID() {
                    var gen = () => {
                        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                    };
                    return (gen() + gen() + '-' + gen() + '-' + gen() + '-' + gen() +
                        '-' + gen() + gen() + gen());
                }
                showModal(data) {
                    if (this.modal == data.modal) {
                        this.modal_data = data;
                        this.modal_obj = this;
                        $(".cpk-modal", ('.' + this.guid)).show();
                        $(".modal-back", ('.' + this.guid)).show();
                    }
                }
                close_modal() {
                    $(".cpk-modal", ('.' + this.guid)).hide();
                    $(".modal-back", ('.' + this.guid)).hide();
                }
                apply_changes() {
                    this.fn.mq.SendMessage({ event_name: 'onModalClose', data: this.modal_data });
                    this.close_modal();
                }
            };
            CpkModal = __decorate([
                aurelia_framework_1.bindable({ name: 'modal', defaultValue: 'na' }),
                aurelia_framework_1.bindable({ name: 'view', defaultValue: 'na' }),
                aurelia_framework_1.bindable({ name: 'width', defaultValue: '' }),
                aurelia_framework_1.inject(FnTs_1.FnTs),
                __metadata("design:paramtypes", [FnTs_1.FnTs])
            ], CpkModal);
            exports_1("CpkModal", CpkModal);
        }
    };
});
