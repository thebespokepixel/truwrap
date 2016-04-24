'use strict'
/*
 *  Client Gulp File
 */

const gulp = require('gulp')
const cordial = require('@thebespokepixel/cordial')

// Comtranspilationatting
gulp.task('coffee', cordial.compile.coffee(['src/**/*.coffee'], './'))

// Tests
gulp.task('ava', cordial.test.ava(['test/*.js']))
gulp.task('xo', cordial.test.xo(['**/*.js', '!{src,lib,scripts,node_modules,test/fixtures}/**/*', '!index.js']))
gulp.task('test', gulp.parallel('xo', 'ava'))

// Guppy Hooks
gulp.task('finish-release', gulp.series('backup'))

// Default
gulp.task('default', gulp.series('bump', 'coffee'))
