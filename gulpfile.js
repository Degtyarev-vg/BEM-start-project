var gulp 						= require('gulp'),
		sass 						= require('gulp-sass'),
		bourbon 				= require('node-bourbon'),
		notify 					= require("gulp-notify"),
		autoprefixer 		= require('gulp-autoprefixer'),
		cleanCSS 				= require('gulp-clean-css'),
		rename 					= require('gulp-rename'),
		browserSync 		= require('browser-sync').create(),
		concat 					= require('gulp-concat'),
		uglify 					= require('gulp-uglify'),
		spritesmith 		= require('gulp.spritesmith'),
		cache 					= require('gulp-cache'),
		imagemin 				= require('gulp-imagemin'),
		pngquant 				= require('imagemin-pngquant'),
		del 						= require('del'),
		gutil 					= require( 'gulp-util' ), 
		ftp 						= require( 'vinyl-ftp' ),
		useref 					= require('gulp-useref'),
		fileinclude 		= require('gulp-file-include'),
		replace 				= require('gulp-replace'),
		mqpacker 				= require('css-mqpacker'),
		postcss 				= require('gulp-postcss');

const pjson = require('./package.json');
const dirs = pjson.config.directories;

gulp.task('browser-sync', function() {
	browserSync.init({
		proxy: "BEM-template"
	});
});

gulp.task('sass', function () {
	return gulp.src(["app/blocks*/**/*.sass", "app/sass/**/*.sass"])
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on("error", notify.onError()))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(postcss([
			mqpacker({
				sort: true
			})
		]))
		.pipe(cleanCSS())
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('libs', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/libs/modernizr/modernizr.js',
		'app/libs/html5shiv/es5-shim.min.js',
		'app/libs/html5shiv/html5shiv.min.js',
		'app/libs/html5shiv/html5shiv-printshiv.min.js',
		'app/libs/magnific-popup/magnific-popup.min.js',
		'app/libs/owl/owl.carousel.min.js',
		'app/libs/waypoints/jquery.waypoints.min.js'
		])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'));
});

gulp.task('useref', function () {
	return gulp.src('app/*.php')
		.pipe(replace(/<!--ST:INK/gm, ''))
		.pipe(replace(/ED:INK-->/gm, ''))
		.pipe(useref())
		.pipe(fileinclude({
			prefix: '@@'
		}))
		.pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
		.pipe(gulp.dest('dist'));
});

gulp.task('blocks-js', function() {
	return gulp.src('app/blocks*/**/*.js')
		.pipe(concat('blocks.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'));
});

gulp.task('png-sprite', function () {
	var spriteData = gulp.src('app/img/icons/png/*.png')
		.pipe(spritesmith({
		imgName: 'png-sprite.png',
		cssName: '_png-sprite.sass',
		imgPath: '../img/png-sprite.png',
		padding: 3
	}));
	spriteData.img.pipe(gulp.dest('app/img/'));
	spriteData.css.pipe(gulp.dest('app/sass/'));
});

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img')); 
});

gulp.task('watch', ['sass', 'libs', 'png-sprite', 'blocks-js', 'browser-sync'], function() {
	gulp.watch('app/*.php', browserSync.reload);
	gulp.watch('app/blocks*/*/**', browserSync.reload);
	gulp.watch('app/blocks*/*/**', ['blocks-js', 'sass']);
	gulp.watch('app/**/*.html', browserSync.reload);
	gulp.watch(['app/**/*.js', '!app/libs/**/*.js'], browserSync.reload);
	gulp.watch('app/blocks*/**/*.js', ['blocks-js']);
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/blocks*/**/*.sass', ['sass']);
	gulp.watch('app/img/icons/png/*.png', ['png-sprite']);
});

gulp.task('removedist', function() { 
	return del.sync('dist'); 
});

gulp.task('build', ['removedist', 'useref', 'imagemin', 'sass', 'libs'], function() {
	var buildCss = gulp.src([
		'app/css/*.css'
		]).pipe(gulp.dest('dist/css'));
	var buildFiles = gulp.src([
		'app/.htaccess'
	]).pipe(gulp.dest('dist'));
	var buildFonts = gulp.src('app/fonts/**/*').pipe(gulp.dest('dist/fonts'));
	var buildJs = gulp.src('app/js/**/*').pipe(gulp.dest('dist/js'));
});

gulp.task('ftp-deploy', function() {

	var conn = ftp.create({
		host:      'host',
		user:      'user',
		password:  'password',
		parallel:  10,
		log: gutil.log
	});

	var remoteFolder = 'domains/prestiz-ltf.ru/public_html/demos/test-css';

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest(remoteFolder));

});

gulp.task('watch', ['sass', 'libs', 'png-sprite', 'blocks-js', 'browser-sync'], function() {
	gulp.watch('app/*.php', browserSync.reload);
	gulp.watch('app/blocks*/*/**', browserSync.reload);
	gulp.watch('app/blocks*/*/**', ['blocks-js', 'sass']);
	gulp.watch('app/**/*.html', browserSync.reload);
	gulp.watch(['app/**/*.js', '!app/libs/**/*.js'], browserSync.reload);
	gulp.watch('app/blocks*/**/*.js', ['blocks-js']);
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/blocks*/**/*.sass', ['sass']);
	gulp.watch('app/img/icons/png/*.png', ['png-sprite']);
});

gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
