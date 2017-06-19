System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var AddFilterGroup;
    return {
        setters: [],
        execute: function () {
            AddFilterGroup = class AddFilterGroup {
                activate(parent) {
                    if (parent != null) {
                        this.parent = parent;
                    }
                }
            };
            exports_1("AddFilterGroup", AddFilterGroup);
        }
    };
});
