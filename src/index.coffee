'use strict'
###
	truwrap (v0.0.4-238)
	Smarter console text wrapping
###

_package = require "./package.json"
ansiRegex = require "ansi-regex"
columnify = require 'columnify'

consoleWrap = module.exports = (options) ->

	#  Options:
	#    left      : left hand margin
	#    right     : right hand margin
	#    mode      : Hard/soft wrap selector
	#    outStream : output stream
	#    modeRegex : Override the normal wrap pattern.
	#                This doesn't change the mode's behaviour,
	#                it just changes how tokens are created.

	{left, right, mode, outStream, modeRegex} = options

	outStream ?= process.stdout
	ttyActive = Boolean outStream.isTTY

	unless ttyActive
		return do ->
			isTTY: false
			end: -> outStream._isStdio or outStream.end()
			getWidth: -> Infinity
			write: (text_) -> outStream.write text_

	ttyWidth = outStream.columns ? outStream.getWindowSize()[0]

	left ?= 0
	right ?= ttyWidth
	right < 0 and right = ttyWidth + right
	width = right - left

	mode ?= 'soft'

	if mode is 'container'
		return do ->
			end: -> outStream._isStdio or outStream.end()
			getWidth: -> ttyWidth
			write: (text_) -> outStream.write text_

	modeRegex ?= do ->
		if mode is 'hard'
			/\b(?![<T>]|[0-9;]+m)/g
		else
			/\S+\s+/g

	preSpaceRegex	= /^\s+/
	postSpaceRegex	= /\s+$/
	tabRegex		   = /\t/g
	newlineRegex	= /\n/

	margin = new Array(ttyWidth).join(' ')

	return do ->
		end: -> outStream._isStdio or outStream.end()
		getWidth: -> width
		panel: (panel_) ->
			columnify panel_.content, panel_.layout
		write: (text_) ->
			lines = []
			line = margin[0..left - 1]
			lineWidth = 0
			indent = 0

			tokens = text_.toString()
					.replace tabRegex, '\x00<T>\x00'
					.replace ansiRegex(), '\x00$&\x00'
					.replace modeRegex, '\x00$&\x00'
					.split "\x00"

			process =
				hard: (token_) ->
					if token_.length <= width then format.line token_
					else for i in [0..token_.length] by width
						format.line token_[i..i + width - 1]

				soft: (token_) -> format.line token_

			format =
				newline: (token_) ->
					lines.push line
					line = margin[0..left - 1]
					line += margin[0..indent - 1] if indent > 0
					lineWidth = indent
					if token_?
						format.linefit token_.replace(preSpaceRegex, '')

				linefit: (token_) ->
					if token_ is "<T>"
						line += margin[0..3]
						lineWidth += 4
						indent += 4

					else if mode is 'soft' and token_.length > width - indent
						format.linefit token_[0..width - indent - 4] + "..."

					else if lineWidth + token_.length > width
						line.replace postSpaceRegex, ''
						format.newline token_

					else
						lineWidth += token_.length
						line += token_

				ansi: (token_) ->
					line += token_

				line: (token_) ->
					if newlineRegex.test token_
						subtokens = token_.split newlineRegex
						format.linefit subtokens.shift()
						indent = 0
						format.newline subtokens.shift() while subtokens.length

					else format.linefit token_

			for token in tokens when token isnt ''
				if ansiRegex().test token then format.ansi token
				else process[mode] token

			lines.push line if line isnt ''

			outStream.write lines.join '\n'


consoleWrap.getVersion = (isLong) ->
	return if isLong then _package.name + " v" + _package.version else _package.version

consoleWrap.image = require('./image')
