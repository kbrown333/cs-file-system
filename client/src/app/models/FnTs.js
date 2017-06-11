System.register(["aurelia-framework", "aurelia-event-aggregator", "./message_queue"], function (exports_1, context_1) {
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
    var aurelia_framework_1, aurelia_event_aggregator_1, message_queue_1, FnTs;
    return {
        setters: [
            function (aurelia_framework_1_1) {
                aurelia_framework_1 = aurelia_framework_1_1;
            },
            function (aurelia_event_aggregator_1_1) {
                aurelia_event_aggregator_1 = aurelia_event_aggregator_1_1;
            },
            function (message_queue_1_1) {
                message_queue_1 = message_queue_1_1;
            }
        ],
        execute: function () {
            FnTs = class FnTs {
                constructor(ea, mq) {
                    this.ea = ea;
                    this.mq = mq;
                }
                fn_Parallel(args) {
                    return new Promise((res, err) => {
                        var data = [];
                        var finished = this.afterSeries(args.length, () => {
                            res(data);
                        });
                        for (var i = 0; i < args.length; i++) {
                            args[i]
                                .then((info) => { data.push(info); return; })
                                .then(() => { finished(); })
                                .catch((ex) => { err(ex); });
                        }
                    });
                }
                fn_Map(data, fn) {
                    return new Promise((res) => {
                        var new_data = data.map((val) => {
                            return fn(val);
                        });
                        res(new_data);
                    });
                }
                fn_Filter(data, fn) {
                    return new Promise((res) => {
                        var new_data = data.filter((val) => {
                            return fn(val);
                        });
                        res(new_data);
                    });
                }
                fn_Reduce(data, fn) {
                    return new Promise((res) => {
                        var new_data = data.reduce((a, b) => {
                            return fn(a, b);
                        });
                        res(new_data);
                    });
                }
                fn_Ajax(data) {
                    return new Promise((res, err) => {
                        $.ajax({
                            type: data.type == null ? 'GET' : data.type,
                            url: data.url,
                            headers: data.headers,
                            data: data.data,
                            processData: data.processData,
                            contentType: data.contentType,
                            success: (rslt) => { res(rslt); },
                            error: (ex) => { err(ex); }
                        });
                    });
                }
                fn_Sort(array, obj, direction) {
                    return new Promise((res) => {
                        var rslt = this.mergeSort(array, obj, direction);
                        res(rslt);
                    });
                }
                fn_FindByKey(array, key, type = "dfs") {
                    return new Promise((res, err) => {
                        if (type == "bfs") {
                            var rslt = this.BfsByKey(array, key);
                            res(rslt);
                        }
                        else {
                            var rslt = this.DfsByKey(array, key);
                            res(rslt);
                        }
                    });
                }
                logText(msg) {
                    return new Promise((res) => {
                        console.log(msg);
                        res(msg);
                    });
                }
                logDir(data) {
                    return new Promise((res) => {
                        console.dir(data);
                        res(data);
                    });
                }
                logError(err) {
                    return new Promise((res) => {
                        console.error(err);
                        res(err);
                    });
                }
                afterSeries(times, func) {
                    return () => {
                        if (--times < 1) {
                            return func.apply(this, arguments);
                        }
                    };
                }
                ;
                mergeSort(arr, obj, direction) {
                    if (arr.length < 2)
                        return arr;
                    var middle = parseInt(String(arr.length / 2));
                    var left = arr.slice(0, middle);
                    var right = arr.slice(middle, arr.length);
                    if (direction == "asc") {
                        return this.merge_ascending(this.mergeSort(left, obj, direction), this.mergeSort(right, obj, direction), obj);
                    }
                    else {
                        return this.merge_descending(this.mergeSort(left, obj, direction), this.mergeSort(right, obj, direction), obj);
                    }
                }
                merge_ascending(left, right, obj) {
                    var result = [];
                    while (left.length && right.length) {
                        if (left[0][obj] <= right[0][obj]) {
                            result.push(left.shift());
                        }
                        else {
                            result.push(right.shift());
                        }
                    }
                    while (left.length)
                        result.push(left.shift());
                    while (right.length)
                        result.push(right.shift());
                    return result;
                }
                merge_descending(left, right, obj) {
                    var result = [];
                    while (left.length && right.length) {
                        if (left[0][obj] >= right[0][obj]) {
                            result.push(left.shift());
                        }
                        else {
                            result.push(right.shift());
                        }
                    }
                    while (left.length)
                        result.push(left.shift());
                    while (right.length)
                        result.push(right.shift());
                    return result;
                }
                DfsByKey(array, key, check_key = '') {
                    if (key == check_key) {
                        return array;
                    }
                    else {
                        var keys = Object.keys(array), found;
                        if (keys.length > 0) {
                            for (var i = 0; i < keys.length; i++) {
                                found = this.DfsByKey(array[keys[i]], key, keys[i]);
                                if (found) {
                                    return found;
                                }
                            }
                        }
                        else {
                            return null;
                        }
                    }
                }
                BfsByKey(array, key) {
                    var queue = [];
                    var keys = Object.keys(array);
                    for (var i = 0; i < keys.length; i++) {
                        queue.push({
                            key: keys[i],
                            array: array
                        });
                    }
                    var obj;
                    while (queue.length > 0) {
                        obj = queue.shift();
                        if (obj.key == key) {
                            return obj.array;
                        }
                        else {
                            keys = Object.keys(obj.array[obj.key]);
                            for (var i = 0; i < keys.length; i++) {
                                queue.push({
                                    key: keys[i],
                                    array: obj.array[obj.key]
                                });
                            }
                        }
                    }
                    return null;
                }
            };
            FnTs = __decorate([
                aurelia_framework_1.inject(aurelia_event_aggregator_1.EventAggregator, message_queue_1.MessageQueue),
                __metadata("design:paramtypes", [aurelia_event_aggregator_1.EventAggregator, message_queue_1.MessageQueue])
            ], FnTs);
            exports_1("FnTs", FnTs);
        }
    };
});
