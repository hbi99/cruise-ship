
'use strict';


/*-------------------------------------------------------------------------
 * Include Gulp & Tools We'll Use
 *
 *-------------------------------------------------------------------------*/

var fs          = require('fs'),
	path        = require('path'),
	colors      = require('colors'),
    del         = require('del'),
	gulp        = require('gulp'),
	$           = require('gulp-load-plugins')(),
	gutil       = require('gulp-util'),
	cleanCSS    = require('gulp-clean-css'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
	sequence    = require('run-sequence');

require('gulp-release-tasks')(gulp);


/*-------------------------------------------------------------------------
 * Setup paths
 *
 *-------------------------------------------------------------------------*/

// variables required
var include_options = {
		prefix    : '@@',
		basepath  : '@file'
	},
	newVersion,
	// path to all source files
	srcPaths = {
		all     : ['.'],
		html    : ['./src/**/*.{htm,svg}', './src/index.htm'],
		scripts : ['./src/res/js/site.js', './src/res/js/*.js', '!./src/res/js/*.min.js'],
		styles  : ['./src/res/css/site.less', './src/res/css/*.less'],
		images  : ['./src/res/img/**/*.{jpg,jpeg,png,gif,webp}']
	},
	// path to where dev files should be placed
	destPaths = {
		base    : './www/',
		script  : './www/res/js/',
		styles  : './www/res/css/',
		images  : './www/res/img/'
	};





/*-------------------------------------------------------------------------
 * Gulp HELP
 *
 *-------------------------------------------------------------------------*/
gulp.task('help', function() {
	console.log('\n----------------------------------------------------------------------------------\n** DEVELOPMENT Mode **\n');
	console.log('  gulp styles'.cyan       +'\t\tCompiles less files'.grey);
	console.log('  gulp scripts'.cyan      +'\t\tConcats, minifies and lints javascript files'.grey);
	console.log('  gulp images'.cyan       +'\t\tOptimizes image files'.grey);
	console.log('  gulp watch'.cyan        +'\t\tWatches and autocompiles files'.grey);
	console.log('  gulp dev'.cyan          +'\t\tCompiles files and watches and starts node-server'.grey);
	console.log('\n----------------------------------------------------------------------------------\n\n');
});



/*-------------------------------------------------------------------------
 * Declaring tasks
 *
 *-------------------------------------------------------------------------*/

gulp.task('clean', del.bind(null, [destPaths.base]));

gulp.task('styles', function() {
	return gulp.src(srcPaths.styles[0])
		.pipe($.less())
		.pipe(cleanCSS({compatibility: 'ie8', keepSpecialComments: 0}))
		.pipe(gulp.dest(destPaths.styles))
		.pipe($.rename({suffix: '.min'}))
		.pipe($.size({title: 'styles'}));
});

// Processes javascript files
gulp.task('scripts', function () {
	return gulp.src(srcPaths.scripts[0])
		.pipe($.fileInclude(include_options))
		.pipe($.uglify())
		.pipe($.rename({suffix: '.min'}))
		.pipe(gulp.dest(destPaths.script))
		.pipe($.size({title: 'scripts'}));
});


// Copy images
gulp.task('images', function () {
	return gulp.src(srcPaths.images)
		.pipe(gulp.dest(destPaths.images))
		.pipe($.size({title: 'images'}));
});

// Processes html files
gulp.task('html', function() {
	return gulp.src(srcPaths.html[1])
		.pipe($.fileInclude(include_options))
		.pipe(gulp.dest(destPaths.base))
		.pipe($.size({title: 'html'}));
});



// Watch source files and moves them accordingly
gulp.task('watch', function () {
    browserSync({
        notify: false,
        server: {
        	index: 'index.htm',
            baseDir: [destPaths.base]
        }
    });
	gulp.watch(srcPaths.html[0], ['html', reload]);
	gulp.watch(srcPaths.scripts, ['scripts', reload]);
	gulp.watch(srcPaths.styles,  ['styles', reload]);
 	gulp.watch(srcPaths.images,  ['images', reload]);
});


// This task is for frontend and non EPi development
gulp.task('dev', function (cb) {
	sequence('clean', ['scripts', 'styles', 'images'], 'html', 'watch', cb);
});



