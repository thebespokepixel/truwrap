"use strict";
###
 truwrap (v0.0.9)
 Smart word wrap, colums and inline images for the CLI
###
_truwrap = require "../../index"

yargs = require 'yargs'
	.strict()
	.options
		h:
			alias: 'help'
			describe: 'Display this help.'
		v:
			alias: 'version'
			count: true
			describe: 'Return the current version. -vv returns a descriptive string.'
		V:
			alias: 'verbose'
			boolean: true
			describe: 'Be verbose. Useful for debugging.'
		l:
			alias: 'left'
			describe: 'Left margin'
			default: 2
		r:
			alias: 'right'
			describe: 'Right margin'
			default: -2
		w:
			alias: 'width'
			describe: 'Width. Sets right margin to [console width - left margin] - width.'
		m:
			alias: 'mode'
			describe: 'Wrapping mode: hard (break long lines) or Soft (keep white space)'
		x:
			alias: 'regex'
			describe: 'Character run selection regex.'

	.showHelpOnFail false, "Use 'wrap --help' for help."

argv = yargs.argv

if argv.version
	console.log _truwrap.getVersion(argv.version > 1)
	process.exit 0

if argv.verbose
	console.log 'Verbose mode:'
	console.dir argv._
	global.verbose = true

if argv.help
	require('./help')(yargs)
	process.exit 0

renderer = require("../..")
	left: argv.left
	right: argv.right
	mode: 'hard'
	outStream: process.stderr

process.stdin.setEncoding('utf8');

process.stdin.on 'readable', () ->
	chunk = process.stdin.read()
	if chunk? then renderer.write(chunk)

process.stdin.on 'end', () ->
	renderer.end()

