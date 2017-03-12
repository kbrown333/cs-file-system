import {bindable} from 'aurelia-framework';

export class EditFname {

	private parent: any;
	
	activate(parent: any) {
		if (parent != null) {
			this.parent = parent;
		}
	}

}
