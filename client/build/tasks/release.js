var gulp = require('gulp');
var transform = require('gulp-transform');
var babel = require('gulp-babel');
var path = require('path');
var argv = require('yargs').argv;
var root = path.join(String(__dirname), '..', '..');
var libs = path.join(root, 'lib');
var start_dir = path.join(root, 'src');

gulp.task('release:display', function () {
    console.log(`root     : ${root}`);
    console.log(`lib      : ${libs}`);
    console.log(`lib_es5  : ${libs_old}`);
    console.log(`start_dir: ${start_dir}`);
});

gulp.task('release:client:html', function () {
    var out_dir;
    if (argv.version_num == null) {
        out_dir = get_out_dir('local');
    } else {
        out_dir = get_out_dir(argv.version_num);
    }
    gulp.src([
        start_dir + '/**/*.html'
    ]).pipe(gulp.dest(out_dir));
});

gulp.task('release:client:js', function () {
    var out_dir;
    if (argv.version_num == null) {
        out_dir = get_out_dir('local');
    } else {
        out_dir = get_out_dir(argv.version_num);
    }
    if (argv.transpile) {
        gulp.src([start_dir + '/**/*.js', '!/**/config.js'])
            .pipe(babel({
                presets: ['es2015'],
                plugins: ["transform-es2015-modules-systemjs"],
                ignore: [
                    '/**/javascript',
                    '/**/jspm_packages',
                    '/**/vendor-build.js',
                    '/**/config.js',
                    '/**/main.js'
                ]
            }))
            .pipe(gulp.dest(out_dir));
    } else {
        gulp.src([start_dir + '/**/*.js', '!/**/config.js'])
            .pipe(gulp.dest(out_dir));
    }
});

gulp.task('release:client:css', function () {
    var out_dir;
    if (argv.version_num == null) {
        out_dir = get_out_dir('local');
    } else {
        out_dir = get_out_dir(argv.version_num);
    }
    gulp.src([
        start_dir + '/**/*.css'
    ]).pipe(gulp.dest(out_dir));
});

gulp.task('release:client:config', function () {
    var out_dir;
    if (argv.version_num == null) {
        out_dir = get_out_dir('local');
    } else {
        out_dir = get_out_dir(argv.version_num);
    }
    gulp.src([path.join(__dirname, '..', 'profiles', 'config.js')])
        .pipe(transform(transformConfigJS, { encoding: 'utf8' }))
        .pipe(gulp.dest(out_dir));
});

gulp.task('release:client', [
    'release:client:html',
    'release:client:js',
    'release:client:css',
    'release:client:config'
], function () {

});

//HELPER FUNCTIONS
function get_out_dir(version) {
    return path.join(libs, version);
}

function transformConfigJS(content) {
    var warning = 'THIS FILE IS AUTO-GENERATED, PLEASE UPDATE THE FOLLOWING FILE INSTEAD: /buildjs/profiles/config.js';
    var lib_path, vnum;
    if (argv.version_num == null) {
        lib_path = '/lib/local';
        return content.replace('{{warning}}', warning).replace('{{baseURL}}', lib_path);
    } else {
        vnum = argv.version_num
        lib_path = `/lib/${argv.version_num}`;
        return content.replace('{{warning}}', warning).replace('{{baseURL}}', lib_path);
    }
}
