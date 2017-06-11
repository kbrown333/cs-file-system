import {bindable, bindingMode, inject} from 'aurelia-framework';
import {FnTs} from '../models/FnTs';

@inject(Element, FnTs)
export class OneClickCustomAttribute {

    @bindable event: string;
    @bindable data: any;
    @bindable that: boolean;

    constructor(private element: Element, private fn: FnTs) {
        $(element).click((event: JQueryEventObject) => {
            if (this.that) {
                this.fn.mq.SendMessage({event_name: this.event, data: {data: this.data, elem: this.element} });
            } else {
                this.fn.mq.SendMessage({event_name: this.event, data: this.data });
            }
        });
    }

    eventChanged(newValue: string, oldValue: string) {
        var x = 1;
    }

    dataChanged(newValue: string, oldValue: string) {
        var x = 1;
    }
}
