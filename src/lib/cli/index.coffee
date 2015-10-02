"use strict";
###
 truwrap (v0.1.18)
 Smart word wrap, colums and inline images for the CLI
###
_truwrap = require "../.."
ansiRegex = require "ansi-regex"
util = require "util"
verbosity = require '@thebespokepixel/verbosity'
console = verbosity.console
				out: process.stderr

yargs = require 'yargs'
	.strict()
	.options
		h:
			alias: 'help'
			describe: 'Display this help.'
		v:
			alias: 'version'
			count: yes
			describe: 'Return the current version on stdout. -vv Return name & version.'
		V:
			alias: 'verbose'
			count: yes
			describe: 'Be verbose. -VV Be loquacious.'
		o:
			alias: 'stderr'
			boolean: yes
			describe: 'Use stderr rather than stdout'
			default: no
		l:
			alias: 'left'
			describe: 'Left margin'
			requiresArg: yes
			default: 2
		r:
			alias: 'right'
			describe: 'Right margin'
			requiresArg: yes
			default: 2
		w:
			alias: 'width'
			describe: 'Width. Overrides right margin.'
			requiresArg: yes
			nargs: 1
		m:
			alias: 'mode'
			choices: ['hard', 'soft']
			describe: 'Wrapping mode: hard (break long lines), soft (keep white space)'
			default: 'hard'
			requiresArg: yes
		e:
			alias: 'encoding'
			describe: 'Set encoding.'
			default: 'utf8'
		s:
			alias: 'stamp'
			boolean: yes
			describe: 'Print arguments rather than stdin. printf-style options supported.'
		t:
			alias: 'table'
			describe: 'Render a table into the available console width.'

		d:
			alias: 'delimiter'
			describe: 'The column delimiter when rendering a table.'
			requiresArg: yes
			default: '|'

		x:
			alias: 'regex'
			describe: 'Character run selection regex. Overrides --mode'
			requiresArg: yes

	.showHelpOnFail no, "Use 'wrap --help' for help."

argv = yargs.argv
outStream = process.stdout
rightMargin = -(argv.right)

if argv.version
	process.stdout.write _truwrap.getVersion(argv.version)
	process.exit 0

if argv.verbose
	switch argv.verbose
		when 1
			console.verbosity 4
			console.log ':Verbose mode:'
		when 2
			console.verbosity 5
			console.log ':Extra-Verbose mode:'
			console.yargs argv

if argv.stdout
	outStream = process.stdout

if argv.help
	require('./help')(yargs)
	process.exit 0

if argv.width > 0
	ttyWidth = outStream.columns ? outStream.getWindowSize()[0]
	rightMargin = -(ttyWidth) + (argv.width + argv.right + argv.left)

if argv.panel
	renderPanel = yes

renderer = (require "../..")
	encoding: argv.encoding
	left: argv.left
	right: rightMargin
	mode: argv.mode
	outStream: outStream

writer = (chunk = new Buffer "\n", argv.encoding) ->
	unless renderPanel is yes
		renderer.write chunk
	else
		maxSpacers = 0
		maxContent = 0
		spacerCols = []
		tableData = for line in (chunk.toString().split /\n/)[..-1]
			columnData = {}
			spacerCount = 0
			contentCount = 0
			for col, i in (line.split argv.delimiter)
				do (col, i) ->
					if col is ':space:'
						spacerCount++
						spacerCols.push i
						columnData["spacer#{i}"] = ' '
						return
					else
						contentCount += col.replace(ansiRegex(), '').length
						columnData["c#{i}"] = col
						return
			maxSpacers = spacerCount if spacerCount > maxSpacers
			maxContent = contentCount if contentCount > maxContent
			columnData

		temp = {}
		for i in spacerCols
			temp["spacer#{i}"] =
				maxWidth: Math.floor renderer.getWidth() / (maxSpacers + 1)
				minWidth: Math.floor (renderer.getWidth() - maxContent) / (maxSpacers + 1)
		renderer.write renderer.panel
			content: tableData
			layout:
				showHeaders: false
				maxLineWidth: renderer.getWidth()
				config: temp

if argv.stamp
	writer util.format.apply @, argv._
	process.exit 0

process.stdin.setEncoding argv.encoding

process.stdin.on 'readable', -> writer process.stdin.read()

process.stdin.on 'end', ->
	renderer.write('\r')
	renderer.end()



