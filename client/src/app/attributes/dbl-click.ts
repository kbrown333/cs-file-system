import {bindable, bindingMode, inject} from 'aurelia-framework';
import {FnTs} from '../models/FnTs';

@inject(Element, FnTs)
export class DblClickCustomAttribute {

    @bindable event: string;
    @bindable data: any;

    constructor(private element: Element, private fn: FnTs) {
        $(element).dblclick((event: JQueryEventObject) => {
            this.fn.mq.SendMessage({event_name: this.event, data: this.data });
        });
    }

    eventChanged(newValue: string, oldValue: string) {
        var x = 1;
    }

    dataChanged(newValue: string, oldValue: string) {
        var x = 1;
    }
}
