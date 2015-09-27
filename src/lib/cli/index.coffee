"use strict";
###
 truwrap (v0.1.3)
 Smart word wrap, colums and inline images for the CLI
###
_truwrap = require "../.."

yargs = require 'yargs'
	.strict()
	.options
		h:
			alias: 'help'
			describe: 'Display this help.'
		v:
			alias: 'version'
			count: yes
			describe: 'Return the current version. -vv returns a descriptive string.'
		V:
			alias: 'verbose'
			boolean: yes
			describe: 'Be verbose. Useful for debugging.'
		o:
			alias: 'stdout'
			boolean: yes
			describe: 'Use stdout rather than stderr'
			default: false
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
			describe: 'Width. Sets right margin to [console width - left margin] - width + left margin.'
		m:
			alias: 'mode'
			describe: 'Wrapping mode: hard (break long lines) or Soft (keep white space)'
			default: 'hard'
		p:
			alias: 'panel'
			describe: 'Render a panel into the available console width.'

		d:
			alias: 'delimiter'
			describe: 'The column delimiter when rendering a panel. The default column delimiter is a colon (:).'
			default: '|'

		x:
			alias: 'regex'
			describe: 'Character run selection regex.'

	.showHelpOnFail false, "Use 'wrap --help' for help."

argv = yargs.argv
outStream = process.stderr
rightMargin = argv.right

if argv.version
	console.log _truwrap.getVersion(argv.version > 1)
	process.exit 0

if argv.verbose
	console.log 'Verbose mode:'
	console.dir argv._
	global.verbose = true

if argv.stdout
	outStream = process.stdout

if argv.help
	require('./help')(yargs)
	process.exit 0

if argv.width
	ttyWidth = outStream.columns ? outStream.getWindowSize()[0]
	rightMargin = -ttyWidth + argv.width + argv.right + argv.left

if argv.panel
	renderPanel = yes

renderer = (require "../..")
	left: argv.left
	right: rightMargin
	mode: argv.mode
	outStream: outStream

process.stdin.setEncoding 'utf8' ;

process.stdin.on 'readable', ->
	chunk = process.stdin.read()
	if chunk?
		unless renderPanel is yes
			renderer.write chunk
		else
			tableData = for line in (chunk.toString().split /\n/)[..-1]
				columnData = {}
				for col, i in (line.split argv.delimiter)
					do (col, i) ->
						if col is ':space:'
							columnData["spacer"] = ' '
						else
							columnData["c#{i}"] = col
				columnData

			renderer.write renderer.panel
				content: tableData
				layout:
					showHeaders: false
					maxLineWidth: renderer.getWidth()
					config:
						spacer:
							minWidth: 8


process.stdin.on 'end', ->
	renderer.write('\r')
	renderer.end()

