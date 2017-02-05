import {inject} from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class FnTs {

    constructor(public ea: EventAggregator) { }

    //public members
    public fn_Parallel(args: Array<Promise<any>>): Promise<any> {
        return new Promise((res, err) => {
            var data = [];
            var finished = this.afterSeries(args.length, () => {
                res(data);
            });
            for (var i = 0; i < args.length; i++) {
                args[i]
                    .then((info: any) => { data.push(info); return; })
                    .then(() => { finished(); })
                    .catch((ex: Error) => { err(ex) });
            }
        });
    }

    public fn_Map(data: Array<any>, fn: Function): Promise<any> {
        return new Promise((res) => {
            var new_data = data.map((val) => {
                return fn(val);
            });
            res(new_data);
        });
    }

    public fn_Filter(data: Array<any>, fn: Function): Promise<any> {
        return new Promise((res) => {
            var new_data = data.filter((val) => {
                return fn(val);
            });
            res(new_data);
        });
    }

    public fn_Reduce(data: Array<any>, fn: Function): Promise<any> {
        return new Promise((res) => {
            var new_data = data.reduce((a, b) => {
                return fn(a, b);
            });
            res(new_data);
        });
    }

    public fn_Ajax(data: any): Promise<any> {
        return new Promise((res, err) => {
            $.ajax({
                type: data.type == null ? 'GET' : data.type,
                url: data.url,
                headers: data.headers,
                data: data.data,
    			processData: data.processData,
    			contentType: data.contentType,
                success: (rslt: any) => { res(rslt); },
                error: (ex: any) => { err(ex); }
            });
        });
    }

    public fn_Sort(array: any, obj: string, direction: string): Promise<any> {
        return new Promise((res) => {
            var rslt = this.mergeSort(array, obj, direction);
            res(rslt);
        });
    }

    public fn_FindByKey(array: any, key: string, type: string = "dfs"): Promise<any> {
        //'type' variable should be either dfs (depth first, default) or bfs (breadth first)
        return new Promise((res, err) => {
            if (type == "bfs") {
                var rslt = this.BfsByKey(array, key);
                res(rslt);
            } else {
                var rslt = this.DfsByKey(array, key);
                res(rslt);
            }
        });
    }

    //output functions - useful for quick error handlers
    public logText(msg: string): Promise<any> {
        return new Promise((res) => {
            console.log(msg);
            res(msg);
        });
    }

    public logDir(data: any): Promise<any> {
        return new Promise((res) => {
            console.dir(data);
            res(data);
        });
    }

    public logError(err: Error): Promise<any> {
        return new Promise((res) => {
            console.error(err);
            res(err);
        });
    }

    // internal functions
    private afterSeries(times: number, func: Function): Function {
        return () => {
            if (--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };

    private mergeSort(arr: any, obj: string, direction: string): any {
        if (arr.length < 2)
            return arr;

        var middle = parseInt(String(arr.length / 2));
        var left = arr.slice(0, middle);
        var right = arr.slice(middle, arr.length);

        if (direction == "asc") {
            return this.merge_ascending(this.mergeSort(left, obj, direction), this.mergeSort(right, obj, direction), obj);
        } else {
            return this.merge_descending(this.mergeSort(left, obj, direction), this.mergeSort(right, obj, direction), obj);
        }
    }

    private merge_ascending(left: any, right: any, obj: string): any {
        var result = [];

        while (left.length && right.length) {
            if (left[0][obj] <= right[0][obj]) {
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        }

        while (left.length)
            result.push(left.shift());

        while (right.length)
            result.push(right.shift());

        return result;
    }

    private merge_descending(left: any, right: any, obj: string): any {
        var result = [];

        while (left.length && right.length) {
            if (left[0][obj] >= right[0][obj]) {
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        }

        while (left.length)
            result.push(left.shift());

        while (right.length)
            result.push(right.shift());

        return result;
    }

    private DfsByKey(array: any, key: string, check_key: string = ''): any {
        if (key == check_key) {
            return array;
        } else {
            var keys = Object.keys(array), found;
            if (keys.length > 0) {
                for (var i = 0; i < keys.length; i++) {
                    found = this.DfsByKey(array[keys[i]], key, keys[i]);
                    if (found) { return found; }
                }
            } else {
                return null;
            }
        }
    }

    private BfsByKey(array: any, key: string): any {
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
            } else {
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
}
