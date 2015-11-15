var gulp         = require('gulp'),
    sequence     = require('gulp-sequence'),
    path         = require('path'),
    argv         = require('yargs').argv,
    prefix       = require('gulp-prefix'),
    clean        = require('gulp-clean'),
    browserSync  = require('browser-sync'),
    compass      = require('gulp-compass'),
    autoprefixer = require('gulp-autoprefixer'),
    jade         = require('gulp-jade'),
    ghPages      = require('gulp-gh-pages'),
    deploy = require('gulp-deploy-git'),
    react = require('gulp-react');

// Web Server
gulp.task('server', function() {
    browserSync({
        server: {
            baseDir: './www',
            index: 'index.html'
        },
        files: ["www/**/*"],
        port: 8080,
        open: true,
        notify: false,
        ghostMode: false
    });
});

// Clean temporary folders
gulp.task('clean', function () {
    return gulp.src(['./www', './.sass-cache'], {read: false})
        .pipe(clean());
});

// SASS to CSS
gulp.task('build-styles', function() {
    return gulp.src('./src/sass/**/*.{sass,scss}')
        .pipe(compass({
            project: path.join(__dirname, ''),
            http_images_path: '/images',
            generated_images_path: 'www/images',
            http_path: '/',
            css: 'www/css',
            sass: 'src/sass',
            image: 'src/images',
            debug: !argv.production,
            relative: true,
            style: argv.production ? 'compressed' : 'nested'
        }))
        .pipe(autoprefixer({
            browsers: ['last 4 versions', 'ie 8'],
            cascade: false
        }))
        .pipe(gulp.dest('./www/css'));
});

gulp.task('build-react', function () {
  return gulp.src('./src/js/**/*.jsx')
    .pipe(react())
    .pipe(gulp.dest('./www/js'));
});

// SVG to SVG sprites
gulp.task('copy-images', function() {
    return gulp.src(['./src/images/**/*', '!./src/images/icons/**/*'], {base: './src'})
        .pipe(gulp.dest('./www'));
});

// Static files
gulp.task('copy-statics', function() {
    return gulp.src(['./src/static/**/*'], {base: './src/static'})
        .pipe(gulp.dest('./www'));
});

// Scripts
gulp.task('copy-scripts', function() {
    return gulp.src(['./src/js/**/*.js'], {base: './src'})
        .pipe(gulp.dest('./www'));
});

// Bower
gulp.task('copy-bower', function() {
    return gulp.src(['./src/bower_components/**/*'], {base: './src'})
        .pipe(gulp.dest('./www'));
});

// Jade to HTML
gulp.task('build-jade', function() {
  return gulp.src('src/jade/*.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest('www'));
});

// Watch for for changes
gulp.task('watch', function() {
    gulp.watch('./src/css/**/*', ['build-styles']);
    gulp.watch('./src/images/**/*', ['copy-images', 'build-styles']);
    gulp.watch('./src/js/**/*.js', ['copy-scripts']);
    gulp.watch('./src/js/**/*.jsx', ['build-react']);
    gulp.watch('./src/jade/**/*', ['build-jade']);
    gulp.watch('./src/bower_components/**/*.js', ['copy-bower']);
    gulp.watch('./src/static/**/*', ['copy-statics']);
});

// Deploy gh-pages
gulp.task('deploy-prefix', function() {
  return gulp.src('./www/**/*.html')
    .pipe(gulp.dest('./www'));
});

gulp.task('deploy', ['deploy-prefix'], function() {
  return gulp.src('./www/**/*')
    .pipe(ghPages());
});


gulp.task('dist-public', function () {
  gulp.src(['./www/**/*','./src/{jade,asdasd}/**/*'])
    .pipe(gulp.dest('./dist/public'));
});
gulp.task('dist-server', function () {
  gulp.src(['./server/**/*'])
    .pipe(gulp.dest('./dist/server'));
});
gulp.task('dist-other', function () {
  gulp.src(['app.js','package.json'])
    .pipe(gulp.dest('./dist'));
});
gulp.task('deploy', function() {
  return gulp.src('dist/**/*')
    .pipe(ghPages({
      branch: 'production'
    }));
});

// Base tasks
gulp.task('build', sequence('clean', ['copy-bower','copy-images','copy-statics', 'copy-scripts', 'build-styles']));

gulp.task('default', sequence('build-dev', ['server', 'watch']));

gulp.task('dist', sequence('build', ['dist-public', 'dist-server','dist-other']));
gulp.task('deploy-dist', sequence('dist','deploy'));
