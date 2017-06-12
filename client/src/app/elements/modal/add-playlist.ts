import {bindable} from 'aurelia-framework';

export class AddPlaylist {

	private parent: any;

	activate(parent: any) {
		if (parent != null) {
			this.parent = parent;
		}
	}

}
