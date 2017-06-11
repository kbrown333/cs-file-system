import {inject} from 'aurelia-framework';
import {FnTs} from '../../models/FnTs';
import {SessionData} from '../../models/session';

@inject(FnTs, SessionData)
export class Files {

	app_events: any;
  	aside_links: any = [
        {name: 'Music', event: 'loadPage', data: 'music'},
        {name: 'Videos', event: 'loadPage', data: 'videos'},
        {name: 'Pictures', event: 'loadPage', data: 'pictures'},
        {name: 'Documents', event: 'loadPage', data: 'documents'}
	];

	constructor(private fn: FnTs, private session: SessionData) {

	}

}
