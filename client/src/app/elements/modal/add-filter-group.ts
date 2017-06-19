import {bindable} from 'aurelia-framework';

export class AddFilterGroup {

	private parent: any;

	activate(parent: any) {
		if (parent != null) {
			this.parent = parent;
		}
	}

}
