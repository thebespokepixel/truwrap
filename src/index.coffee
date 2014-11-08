'use strict'
###
 console-wrap (v0.0.4-579)
 Smarter text wrapping
###

_package = require "./package.json"
ansiRegex = require "ansi-regex"

consoleWrap = module.exports = (options) ->
	{left, right, mode, outStream, modeRegex} = options

	outStream ?= process.stdout
	ttyActive = Boolean outStream.isTTY

	unless ttyActive
		return (text_) -> outStream.write text_

	ttyWidth = outStream.columns ? outStream.getWindowSize()[0]

	left ?= 0
	right ?= ttyWidth
	right < 0 and right = ttyWidth + right
	width = right - left

	mode ?= 'soft'

	modeRegex ?= do ->
		if mode is 'hard'
			/\b(?![0-9;]+m)/g
		else
			/\S+\s+/g

	preSpaceRegex	= /^\s+/
	postSpaceRegex	= /\s+$/
	tabRegex		= /\t/g
	newlineRegex	= /\n/

	margin = new Array(ttyWidth).join(' ')

	return (text_) ->

		lines = []
		line = ''
		lineWidth = 0

		tokens = text_.toString()
				.replace tabRegex, '    '
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
				lineWidth = 0
				if token_?
					format.linefit token_.replace(preSpaceRegex, '')

			linefit: (token_) ->
				if mode is 'soft' and token_.length > width
					format.linefit token_[0..width - 4] + "..."

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
					format.newline subtokens.shift() while subtokens.length

				else format.linefit token_

		for token in tokens when token isnt ''
			if ansiRegex().test token then format.ansi token
			else process[mode] token

		outStream.write lines.join '\n'

consoleWrap.getVersion = (isLong) ->
	return if isLong then _package.name + " v" + _package.version else _package.version


