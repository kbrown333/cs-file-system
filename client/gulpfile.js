var gulp = require("gulp");
var bundler = require('aurelia-bundler');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var vendor_config = {
    force: true,
    baseURL: './src',
    configPath: './src/config.js',
    bundles: {
        "vendor-build": {
            includes: [
                'aurelia-bootstrapper',
                'aurelia-dependency-injection',
                'aurelia-framework',
                'aurelia-templating-binding',
                'aurelia-templating-resources',
                'aurelia-loader-default',
                'aurelia-fetch-client',
                'aurelia-router',
                'aurelia-templating-router',
                'aurelia-history-browser',
                'aurelia-logging-console',
                'aurelia-event-aggregator',
                'jquery',
				'bootstrap'
            ],
            options: {
                inject: true,
                minify: true
            }
        }
    }
};

//BUILD JSPM PACKAGES AND CUSTOM TYPESCRIPT FILES
gulp.task("build:all", ["bundle-vendor"], function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("src"));
});

//BUILD ONLY THE CUSTOM TYPESCRIPT FILES
gulp.task("build", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("src"));
});

//BUILD JSPM PACKAGES ONLY
gulp.task('bundle-vendor', function (callback) {
    return bundler.bundle(vendor_config);
	callback();
});
