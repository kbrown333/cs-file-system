System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function configure(aurelia) {
        aurelia.use.standardConfiguration().developmentLogging();
        aurelia.start().then(a => a.setRoot("app/app"));
    }
    exports_1("configure", configure);
    return {
        setters: [],
        execute: function () {
        }
    };
});
