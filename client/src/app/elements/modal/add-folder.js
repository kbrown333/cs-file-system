System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var AddFolder;
    return {
        setters: [],
        execute: function () {
            AddFolder = class AddFolder {
                activate(parent) {
                    if (parent != null) {
                        this.parent = parent;
                    }
                }
            };
            exports_1("AddFolder", AddFolder);
        }
    };
});
