System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var AddPlaylist;
    return {
        setters: [],
        execute: function () {
            AddPlaylist = class AddPlaylist {
                activate(parent) {
                    if (parent != null) {
                        this.parent = parent;
                    }
                }
            };
            exports_1("AddPlaylist", AddPlaylist);
        }
    };
});
