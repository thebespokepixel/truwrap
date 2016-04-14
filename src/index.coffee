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

_package =      require './package.json'
util =          require "util"
verbosity =     require 'verbosity'
StringDecoder = require('string_decoder').StringDecoder
ansiRegex =     require 'ansi-regex'
columnify =     require 'columnify'
trucolor =      require 'trucolor'
clr =           trucolor.simplePalette()

truwrap = module.exports = (options) ->

	#  Options:
	#    left      : left hand margin
	#    right     : right hand margin
	#	  width     : override right margin and force wrapping width
	#    mode      : Hard/soft/keep/container wrap selector (soft)
	#    outStream : output stream.
	#    modeRegex : Override the normal wrap pattern.
	#                This doesn't change the mode's behaviour,
	#                it just changes how tokens are created.

	{left = 2, right = 2, width, mode = 'soft', outStream = process.stdout, modeRegex} = options

	ttyActive = Boolean(outStream.isTTY or width? or mode.match /keep|container/)
	_decoder = new StringDecoder

	unless ttyActive
		console.debug "Non-TTY: width: Infinity"
		return do ->
			isTTY: false
			end: -> if outStream._isStdio then -> outStream.write  do _decoder.end
			else -> outStream.end do _decoder.end
			getWidth : -> Infinity
			panel: (panel_) -> columnify panel_.content, panel_.layout
			write    : (buffer_) -> outStream.write _decoder.write buffer_

	outStream.setEncoding 'utf8' if outStream.isTTY
	ttyWidth = width ? outStream.columns ? outStream.getWindowSize()[0]

	width = if ttyWidth - right - left > 1
		ttyWidth - right - left
	else
		2

	if mode is 'container'
		console.debug "Container: width: #{ttyWidth}, mode: #{mode}"
		return do ->
			end: -> if outStream._isStdio then -> outStream.write  do _decoder.end
			else -> outStream.end do _decoder.end
			getWidth : -> ttyWidth
			write    : (buffer_) -> outStream.write _decoder.write buffer_

	modeRegex ?= switch mode
		when 'hard'
			/\b(?![<T>]|[0-9;]+m)/g
		when 'keep'
			/^.*$/mg
		else
			/\S+\s+/g

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
			lineBlock = no

			tokens = _decoder.write buffer_
				.replace tabRegex, '\u0000<T>\u0000'
				.replace ansiRegex(), '\u0000$&\u0000'
				.replace modeRegex, '\u0000$&\u0000'
				.split "\u0000"

			process =
				hard: (token_) ->
					if token_.length <= width then format.line token_
					else for i in [0...token_.length] by width
						format.line token_[i...i + width]

				soft: (token_) -> format.line token_

				keep: (token_) ->
					if token_.length > width
						console.debug "1st keep fitting: #{token_}"
						format.line token_[0...(width - 1)] + clr.normal + "…"
						lineBlock = yes
					else format.line token_

			format =
				newline: (token_) ->
					lines.push line
					line = margin[...left]
					lineWidth = 0
					lineBlock = no
					if token_?
						format.linefit do token_.trimLeft

				linefit: (token_) ->
					if token_ is "<T>"
						return

					else if lineBlock
						return

					else if mode is 'hard' and lineWidth + token_.length > width
						line = do line.trimLeft
						diff = lineWidth - line.length
						lineWidth += diff
						line = "#{margin[...left]}#{line}"
						line += token_[...(width - lineWidth)]
						format.newline token_[(width - lineWidth)...]
						return

					else if mode is 'soft' and token_.length > width
						console.debug "Soft fitting: #{token_}"
						format.linefit token_[..width - 2] + clr.normal + "…"

					else if mode is 'keep' and lineWidth + token_.length >= width
						switch width - lineWidth
							when width
								console.debug "2nd keep commit: #{token_}."
								line += token_[...(width - lineWidth - 1)] + clr.normal + "…"
							when 0
								console.debug "2nd keep set ellipsis: #{token_}."
								line[...-1] = clr.normal + '…'
							when 1
								console.debug "2nd keep add ellipsis: #{token_}."
								line += clr.normal + '…'
							else
								console.debug "2nd keep fitting: #{token_}."
								line += token_[...(width - lineWidth - 1)] + clr.normal + "…"
						lineBlock = yes
						return

					else if lineWidth + token_.length > width
						line = do line.trimRight
						format.newline token_
						return

					else
						lineWidth += token_.length
						line      += token_
						return

				ansi: (token_) ->
						line += token_
						return

				line: (token_) ->
					if newlineRegex.test token_
						subtokens = token_.split "\n"
						format.linefit subtokens.shift()
						format.newline subtokens.shift() while subtokens.length

					else format.linefit token_

			for token in tokens when token isnt ''
				if ansiRegex().test token then format.ansi token
				else process[mode] token

			line = do line.trimRight
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
