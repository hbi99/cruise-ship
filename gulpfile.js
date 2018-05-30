
'use strict';


/*-------------------------------------------------------------------------
 * Include Gulp & Tools We'll Use
 *
 *-------------------------------------------------------------------------*/

var fs          = require('fs'),
	path        = require('path'),
	pckg        = require('./package.json'),
	colors      = require('colors'),
	gulp        = require('gulp'),
	$           = require('gulp-load-plugins')(),
	gutil       = require('gulp-util'),
	autoprefix  = require('gulp-autoprefixer'),
	cleanCSS    = require('gulp-clean-css'),
	replace     = require('gulp-regex-replace'),
	stylish     = require('jshint-stylish'),
	sequence    = require('run-sequence');

require('gulp-release-tasks')(gulp);


/*-------------------------------------------------------------------------
 * Setup paths
 *
 *-------------------------------------------------------------------------*/

// variables required
var pkgName = pckg.name,
	include_options = {
		prefix    : '@@',
		basepath  : '@file'
	},
	oldVersion = pckg.version,
	newVersion,
	// path to all source files
	srcPaths = {
		all     : ['.'],
		html    : ['./**/*.{htm,svg}', '!./index.min.htm', './index.htm'],
		scripts : [
			'./res/js/site.js',
			'./res/js/*.js',
			'!./res/js/*.min.js'
		],
		styles  : ['./res/css/site.less', './res/css/*.less'],
		images  : ['./res/img/**/*.{jpg,jpeg,png,gif,webp}']
	},
	// path to where dev files should be placed
	destPaths = {
		base    : './res/',
		script  : './res/js/',
		styles  : './res/css/',
		images  : './res/img/'
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
	console.log('  gulp watch'.cyan        +'\t\tWatch and autocompiles files'.grey);
	console.log('\n----------------------------------------------------------------------------------\n\n');
});



/*-------------------------------------------------------------------------
 * Declaring tasks
 *
 *-------------------------------------------------------------------------*/

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
	//	.pipe($.uglify())
		.pipe($.rename({suffix: '.min'}))
		.pipe(gulp.dest(destPaths.script))
		.pipe($.size({title: 'scripts'}));
});


// Copy images
gulp.task('images', function () {
	return gulp.src(srcPaths.images)
		.pipe($.imagemin({
			optimizationLevel: 7,
			progressive: true
		}))
		.pipe(gulp.dest(destPaths.images))
		.pipe($.size({title: 'images'}));
});

// Processes html files
gulp.task('html', function() {
	return gulp.src(srcPaths.html[2])
		.pipe($.fileInclude(include_options))
		.pipe($.rename({suffix: '.min'}))
		.pipe(gulp.dest('.'))
		.pipe($.size({title: 'html'}));
});



// Watch source files and moves them accordingly
gulp.task('watch', function () {
	gulp.watch(srcPaths.html.slice(0,2), ['html']);
	gulp.watch(srcPaths.styles,  ['styles']);
	gulp.watch(srcPaths.scripts, ['scripts']);
// 	gulp.watch(srcPaths.images, ['images']);
});


// This task is for frontend and non EPi development
gulp.task('PUBL', function (cb) {
	sequence(['scripts', 'styles', 'images'], cb);
});



