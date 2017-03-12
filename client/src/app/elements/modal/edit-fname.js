System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var EditFname;
    return {
        setters: [],
        execute: function () {
            EditFname = class EditFname {
                activate(parent) {
                    if (parent != null) {
                        this.parent = parent;
                    }
                }
            };
            exports_1("EditFname", EditFname);
        }
    };
});
