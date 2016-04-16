"use strict"
###
	truwrap
	Smart word wrap, colums and inline images for the CLI
###
truwrap        = require '../..'
ansiRegex      = require 'ansi-regex'
getStdin       = require 'get-stdin'
util           = require 'util'
updateNotifier = require 'update-notifier'
console        = global.vConsole
_package       = require '../../package.json'

yargs = require 'yargs'
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
			describe: 'Set total width. Overrides terminal window’s width.'
			requiresArg: yes
			nargs: 1
		m:
			alias: 'mode'
			choices: ['hard', 'soft', 'keep', 'container']
			describe: 'Wrapping mode'
			default: 'soft'
			requiresArg: yes
		s:
			alias: 'stamp'
			boolean: yes
			describe: 'Print arguments rather than stdin. printf-style options supported.'
		p:
			alias: 'panel'
			describe: 'Render a tabular panel into the available console width.'
		d:
			alias: 'delimiter'
			describe: 'The column delimiter when reading data for a panel.'
			requiresArg: yes
			default: '|'
		x:
			alias: 'regex'
			describe: 'Character run selection regex.'
			requiresArg: yes
		color:
			describe: 'Force color depth --color=256|16m. Disable with --no-color'

	.showHelpOnFail no, "Use 'wrap --help' for help."

argv = yargs.argv
outStream = process.stdout

if argv.version
	process.stdout.write truwrap.getVersion(argv.version)
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

unless process.env.USER is 'root' and process.env.SUDO_USER isnt process.env.USER
	do updateNotifier
		pkg: _package
	.notify

if argv.stderr
	outStream = process.stderr

if argv.help
	require('./help')(yargs)
	process.exit 0

if argv.panel
	renderPanel = yes

renderSettings =
	encoding: argv.encoding
	left: argv.left
	right: argv.right
	mode: argv.mode
	outStream: outStream

renderSettings.modeRegex = new RegExp(argv.regex, 'g') if argv.regex?
renderSettings.width = argv.width if argv.width?

renderer = (require "../..") renderSettings

writer = (buffer_) ->
	longIdx = 0
	maxCols = 0
	spacerCols = []
	tableData = for row, rowIdx in (buffer_.toString().split '\n')
		columnData = {}
		fieldCount = 0
		contentCount = 0
		for col, colIdx in (row.split argv.delimiter)
			do (col, colIdx) ->
				if col is ':space:'
					spacerCols.push colIdx
					columnData["spacer#{colIdx}"] = ' '
					return
				else if colIdx in spacerCols
					columnData["spacer#{colIdx}"] = ' '
					return
				else
					columnData["c#{colIdx}"] = col
					return
		if colIdx > maxCols
			maxCols = colIdx
			longIdx = rowIdx

		columnData

	configuration = {}

	Object.keys(tableData[longIdx]).forEach (idx_) ->
		if idx_.includes 'spacer'
			configuration[idx_] =
				maxWidth: 16
				minWidth: 4
		else
			configuration[idx_] =
				maxWidth: (renderer.getWidth() - spacerCols.length * 16) / (maxCols - spacerCols.length)
				minWidth: (renderer.getWidth() - spacerCols.length * 4) / (maxCols - spacerCols.length)

	renderer.write renderer.panel
		content: tableData
		layout:
			showHeaders: false
			config: configuration

getStdin().then (buffer_) ->
	unless renderPanel is yes
		renderer.write buffer_
	else
		writer buffer_

if argv.stamp
	writer util.format.apply this, argv._
	process.exit 0

