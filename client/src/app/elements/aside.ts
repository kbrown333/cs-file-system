import {inject} from 'aurelia-framework';
import {FnTs} from '../models/FnTs';
import {AggregateData} from '../models/message_queue';

@inject(FnTs)
export class Aside {

	app_events: any;

	constructor(private fn: FnTs) {

	}

	attached() {
		this.app_events = this.fn.mq.Subscribe((event: AggregateData) => {
            if (event.target != null && event.target != 'music-player') { return; }
            if (this[event.event_name] != null) { this[event.event_name](event.data); }
        });
	}

	detached() {
		this.app_events.dispose();
	}

	hideMe() {
		$(".hide-aside").toggle();
	}

	refreshIndex = () => {
		this.hideMe();
		this.fn.mq.SendMessage({event_name: 'refreshFileIndexes', target: 'app'})
	}

	//Event Aggregator Functions


}
