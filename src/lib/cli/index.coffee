"use strict";
###
 truwrap (v0.0.6)
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
		r:
			alias: 'right'
			describe: 'Right margin'
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
#	yargs.wrap(100).showHelp()
	require('./help')(yargs)
	process.exit 0





# var renderer = require( "../index.js")({  left: 2,
# 										  right: process.stderr.columns - 2,
# 										  mode: 'soft',
# 										  outStream: process.stderr });

# process.stdin.setEncoding('utf8');

# process.stdin.on('readable', function() {
#   var chunk = process.stdin.read();
#   if (chunk !== null) {
#     renderer.write(chunk);
#   }
# });

# process.stdin.on('end', function() {
#   renderer.end();
# });

