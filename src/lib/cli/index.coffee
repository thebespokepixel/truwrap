"use strict";
###
 truwrap (v0.1.10)
 Smart word wrap, colums and inline images for the CLI
###
_truwrap = require "../.."
ansiRegex = require "ansi-regex"

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
			describe: 'Width. Sets right margin to [console-width - width - left margin - left margin].'
			requiresArg: yes
			nargs: 1
		m:
			alias: 'mode'
			choices: ['hard', 'soft', 'regex']
			describe: 'Wrapping mode: hard (break long lines), soft (keep white space) or regex (use the --regex option)'
			default: 'hard'
			requiresArg: yes
		p:
			alias: 'panel'
			describe: 'Render a panel into the available console width.'

		d:
			alias: 'delimiter'
			describe: 'The column delimiter when rendering a panel. The default column delimiter is | (vertical bar).'
			requiresArg: yes
			default: '|'

		x:
			alias: 'regex'
			describe: 'Character run selection regex.'
			requiresArg: yes

	.showHelpOnFail no, "Use 'wrap --help' for help."

argv = yargs.argv
outStream = process.stderr
rightMargin = -(argv.right)

if argv.version
	console.log _truwrap.getVersion(argv.version > 1)
	process.exit 0

if argv.verbose
	console.log 'Verbose mode:'
	console.dir argv
	global.verbose = true

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
						else
							contentCount += col.replace(ansiRegex(), '').length
							columnData["c#{i}"] = col
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
					config:
						temp


process.stdin.on 'end', ->
	renderer.write('\r')
	renderer.end()

