import {bindable, bindingMode, inject} from 'aurelia-framework';

@inject(Element)
export class ToggleMeCustomAttribute {

    constructor(private element: Element) {

    }

    valueChanged(newValue: string, oldValue: string) {
        //available values are 'hide', 'remove', 'show', or any css 'display' value
        this.changeDisplayState(newValue);
    }

    changeDisplayState(state: string) {
        if (state == "hide") {
            $(this.element).hide();
        } else if (state == "remove") {
            $(this.element).remove();
        } else if (state == "show") {
            $(this.element).show();
        } else if (state == "slide") {
            $(this.element).toggle('slide');
        } else if (state == "stage") {
            //this is intentionally blank to allow 
            //slide to work bi-directionally
        } else {
            $(this.element).css('display', 'inline-block');
        }
    }
}