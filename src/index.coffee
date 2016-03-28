'use strict'
###
	truwrap
	Smarter 24bit console text wrapping

	Copyright (c) 2016 Mark Griffiths

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use, copy,
	modify, merge, publish, distribute, sublicense, and/or sell copies
	of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
###

console = global.vConsole ?= require('verbosity').console
	out: process.stderr

_package =       require './package.json'
util =          require "util"
verbosity =     require 'verbosity'
StringDecoder = require('string_decoder').StringDecoder
ansiRegex =     require 'ansi-regex'
columnify =     require 'columnify'

truwrap = module.exports = (options) ->

	#  Options:
	#    left      : left hand margin
	#    right     : right hand margin
	#	  width     : override right margin and force wrapping width
	#    mode      : Hard/soft wrap selector (soft)
	#    outStream : output stream.
	#    modeRegex : Override the normal wrap pattern.
	#                This doesn't change the mode's behaviour,
	#                it just changes how tokens are created.

	{left = 2, right = 2, width, mode = 'soft', outStream = process.stdout, modeRegex} = options

	ttyActive = Boolean(outStream.isTTY) or width?
	_decoder = new StringDecoder
	outStream.setEncoding 'utf8'

	unless ttyActive
		console.debug "Non-TTY: width: Infinity"
		return do ->
			isTTY: false
			end: -> if outStream._isStdio then -> outStream.write  do _decoder.end
			else -> outStream.end do _decoder.end
			getWidth : -> Infinity
			panel: (panel_) -> columnify panel_.content, panel_.layout
			write    : (buffer_) -> outStream.write _decoder.write buffer_

	ttyWidth = width ? outStream.columns ? outStream.getWindowSize()[0]

	width = ttyWidth - right - left

	if mode is 'container'
		console.debug "Container: width: #{ttyWidth}, mode: #{mode}"
		return do ->
			end: -> if outStream._isStdio then -> outStream.write  do _decoder.end
			else -> outStream.end do _decoder.end
			getWidth : -> ttyWidth
			write    : (buffer_) -> outStream.write _decoder.write buffer_

	modeRegex ?= if mode is 'hard'
			/\b(?![<T>]|[0-9;]+m)/g
		else
			/\S+\s+/g

	preSpaceRegex	= /^\s+/
	postSpaceRegex	= /[\s]+$/
	tabRegex		   = /\t/g
	newlineRegex	= /\n/

	margin = new Array(ttyWidth).join(' ')

	console.debug "Renderer: left: #{left}, right: #{right}, width: #{width}, mode: #{mode}"

	return do ->
		end: -> if outStream._isStdio then -> outStream.write  do _decoder.end
		else -> outStream.end do _decoder.end
		getWidth: -> width
		panel: (panel_) -> columnify panel_.content, panel_.layout
		break: (count = 1) -> outStream.write "\n".repeat(count)
		clear: -> outStream.write "\n"
		write: (buffer_, write_ = yes) ->
			lines = []
			line = margin[0...left]
			lineWidth = 0
			indent = 0

			tokens = _decoder.write buffer_
				.replace tabRegex, '\u0000<T>\u0000'
				.replace ansiRegex(), '\u0000$&\u0000'
				.replace modeRegex, '\u0000$&\u0000'
				.split "\u0000"

			process =
				hard: (token_) ->
					if token_.length <= width then format.line token_
					else for i in [0..token_.length] by width
						format.line token_[i...i + width]

				soft: (token_) -> format.line token_

			format =
				newline: (token_) ->
					lines.push line
					line = margin[0...left]
					line += margin[0...indent]
					lineWidth = indent
					if token_?
						format.linefit token_.replace(preSpaceRegex, '')

				linefit: (token_) ->
					if token_ is "<T>"
						line      += margin[0..3]
						lineWidth += 4
						indent    += 4
						return

					else if mode is 'soft' and token_.length > width - indent
						format.linefit token_[0..width - indent - 4] + "…"

					else if lineWidth + token_.length > width
						line = line.replace postSpaceRegex, ''
						format.newline token_

					else
						lineWidth += token_.length
						line      += token_
						return

				ansi: (token_) ->
					line += token_
					return

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

			line = line.replace postSpaceRegex, ''
			lines.push line
			outStream.write _decoder.write lines.join '\n' if write_
			lines.join '\n'

truwrap.getName =                -> _package.name
truwrap.getBin =                 -> Object.keys(_package.bin)[0]
truwrap.getDescription =         -> _package.description
truwrap.getCopyright =           -> "©#{_package.copyright.year} #{_package.copyright.owner}"
truwrap.getBugs =                -> _package.bugs.url
truwrap.getVersion = (long_ = 1) ->
	version = if _package.build_number > 0
		"#{_package.version}-Δ#{_package.build_number}"
	else
		"#{_package.version}"

	switch long_
		when 3 then "v#{version}"
		when 2 then "#{_package.name} v#{version}"
		else "#{version}"

truwrap.Image = require('./lib/image')
