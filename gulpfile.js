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
    return gulp.src(['./public', './.sass-cache'], {read: false})
        .pipe(clean());
});

// SASS to CSS
gulp.task('build-styles', function() {
    return gulp.src('./src/sass/**/*.{sass,scss}')
        .pipe(compass({
            project: path.join(__dirname, ''),
            http_images_path: '/images',
            generated_images_path: 'public/images',
            http_path: '/',
            css: 'public/css',
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
        .pipe(gulp.dest('./public/css'));
});


// SVG to SVG sprites
gulp.task('copy-images', function() {
    return gulp.src(['./src/images/**/*', '!./src/images/icons/**/*'], {base: './src'})
        .pipe(gulp.dest('./public'));
});

// Static files
gulp.task('copy-statics', function() {
    return gulp.src(['./src/static/**/*'], {base: './src/static'})
        .pipe(gulp.dest('./public'));
});

// Scripts
gulp.task('copy-scripts', function() {
    return gulp.src(['./src/js/**/*.js'], {base: './src'})
        .pipe(gulp.dest('./public'));
});

// Bower
gulp.task('copy-bower', function() {
    return gulp.src(['./src/bower_components/**/*'], {base: './src'})
        .pipe(gulp.dest('./public'));
});

// Jade
gulp.task('copy-jade', function() {
  return gulp.src(['./src/jade/**/*'], {base: './src'})
    .pipe(gulp.dest('./public'));
});

// Watch for for changes
gulp.task('watch', function() {
    gulp.watch('./src/css/**/*', ['build-styles']);
    gulp.watch('./src/images/**/*', ['copy-images', 'build-styles']);
    gulp.watch('./src/js/**/*.js', ['copy-scripts']);
    gulp.watch('./src/js/**/*.jsx', ['build-react']);
    gulp.watch('./src/jade/**/*', ['copy-jade']);
    gulp.watch('./src/bower_components/**/*.js', ['copy-bower']);
    gulp.watch('./src/static/**/*', ['copy-statics']);
});

gulp.task('deploy-production', function() {
  return gulp.src(['server/**/*','public/**/*','app.js','package.json'], {base: './'})
    .pipe(ghPages({
      branch: 'text-production'
    }));
});

// Base tasks
gulp.task('build', sequence('clean', ['copy-bower','copy-images','copy-statics', 'copy-scripts', 'copy-jade', 'build-styles']));
gulp.task('build-public', sequence('build'));
//gulp.task('default', sequence('build-dev', ['watch']));

gulp.task('dist', sequence('build', ['dist-public', 'dist-server','dist-other']));
gulp.task('deploy-dist', sequence('dist','deploy'));
