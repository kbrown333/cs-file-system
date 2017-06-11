import {inject} from "aurelia-framework";
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class MessageQueue {

	constructor(public ea: EventAggregator) { }

	public Subscribe(callback: Function) {
		return this.ea.subscribe('react', callback);
	}

	public SendMessage(msg: AggregateData) {
		this.ea.publish('react', msg);
	}

}

export interface AggregateData {
	event_name: string;
	target?: string;
	data?: any;
}
