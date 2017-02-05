System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var SessionData;
    return {
        setters: [],
        execute: function () {
            SessionData = class SessionData {
                constructor() {
                    this.runtime = {};
                    this.visibility = {
                        aside: 'hide'
                    };
                }
            };
            exports_1("SessionData", SessionData);
        }
    };
});
