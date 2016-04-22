'use strict'
/*
 *  Client Gulp File
 */

const gulp = require('gulp')
const cordial = require('@thebespokepixel/cordial')

// Default
gulp.task('default', ['coffee'])

// Versioning
gulp.task('inc-build', cordial.version.build.inc)
gulp.task('reset-build', cordial.version.build.reset)
gulp.task('bump', ['inc-build'], cordial.version.build.write)
gulp.task('reset', ['reset-build'], cordial.version.build.write)
gulp.task('test-reset', ['test'], cordial.version.build.resetWrite)

// Comtranspilationatting
gulp.task('coffee', ['bump'], cordial.compile.coffee(['src/**/*.coffee'], './'))

// Tests
gulp.task('test', ['xo'], cordial.test.ava(['test/*.js']))
gulp.task('xo', cordial.test.xo(['**/*.js', '!{src,lib,scripts,node_modules}/**/*', '!index.js']))

// npm
gulp.task('publish', cordial.npm.publish)

// Git
gulp.task('commit', cordial.git.commitAll)
gulp.task('push', cordial.git.pushAll('origin'))
gulp.task('backup', ['push'], cordial.git.pushAll('backup'))
gulp.task('publish-push', ['publish'], cordial.git.pushAll('origin'))
gulp.task('publish-backup', ['publish-push'], cordial.git.pushAll('backup'))

// Guppy Hooks
gulp.task('post-flow-release-start', ['reset'], cordial.flow.release.start)
gulp.task('post-flow-release-finish', ['publish-backup'])
gulp.task('filter-flow-release-start-version', cordial.flow.release.versionFilter)
gulp.task('filter-flow-release-finish-tag-message', cordial.flow.release.tagFilter)
