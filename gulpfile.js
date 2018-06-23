/* ─────────────╮
 │ gulp/cordial │
 ╰──────────────┴────────────────────────────────────────────────────────────── */
const gulp = require('gulp')
const rename = require('gulp-rename')
const chmod = require('gulp-chmod')
const strip = require('gulp-strip-comments')
const rollup = require('gulp-better-rollup')
const babel = require('rollup-plugin-babel')
const lodash = require('babel-plugin-lodash')

const external = [
	'path',
	'fs',
	'util',
	'@thebespokepixel/meta',
	'@thebespokepixel/n-selector',
	'@thebespokepixel/string',
	'term-ng',
	'get-stdin',
	'read-pkg-up',
	'columnify',
	'os-locale',
	'verbosity',
	'common-tags',
	'deep-assign',
	'lodash/min',
	'lodash/max',
	'lodash/split',
	'lodash/forEach',
	'semver',
	'trucolor',
	'yargs',
	'ansi-regex',
	'update-notifier'
]

const babelConfig = {
	plugins: [lodash],
	presets: [
		['@babel/preset-env', {
			modules: false,
			targets: {
				node: '8.0.0'
			}
		}]
	],
	exclude: 'node_modules/**'
}

gulp.task('cjs', () =>
	gulp.src('src/main.js')
		.pipe(strip())
		.pipe(rollup({
			external,
			plugins: [babel(babelConfig)]
		}, {
			format: 'cjs'
		}))
		.pipe(rename('index.js'))
		.pipe(gulp.dest('.'))
)

gulp.task('es6', () =>
	gulp.src('src/main.js')
		.pipe(strip())
		.pipe(rollup({
			external,
			plugins: [babel(babelConfig)]
		}, {
			format: 'es'
		}))
		.pipe(rename('index.mjs'))
		.pipe(gulp.dest('.'))
)

gulp.task('cli', () =>
	gulp.src('src/cli/main.js')
		.pipe(strip())
		.pipe(rollup({
			external,
			plugins: [babel(babelConfig)]
		}, {
			banner: '#! /usr/bin/env node',
			format: 'cjs'
		}))
		.pipe(rename('truwrap'))
		.pipe(chmod(0o755))
		.pipe(gulp.dest('bin'))
)

gulp.task('default', gulp.series('cjs', 'es6', 'cli'))
