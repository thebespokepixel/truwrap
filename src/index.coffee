'use strict'
###
	truwrap (v0.1.14)
	Smarter 24bit console text wrapping

	Copyright (c) 2015 CryptoComposite

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

_package = require './package.json'
StringDecoder = require('string_decoder').StringDecoder

ansiRegex = require 'ansi-regex'
columnify = require 'columnify'

truwrap = module.exports = (options) ->

	#  Options:
	#    left      : left hand margin
	#    right     : right hand margin
	#    mode      : Hard/soft wrap selector (soft)
	#    outStream : output stream.
	#    encoding  : Text encoding. (utf8)
	#    modeRegex : Override the normal wrap pattern.
	#                This doesn't change the mode's behaviour,
	#                it just changes how tokens are created.

	{left, right, mode, outStream, encoding, modeRegex} = options

	_encoder = new StringDecoder encoding ?= 'utf8'

	outStream ?= process.stdout
	ttyActive = Boolean outStream.isTTY
	outStream.setEncoding encoding

	unless ttyActive
		return do ->
			isTTY: false
			end      : -> outStream._isStdio or outStream.end()
			getWidth : -> Infinity
			write    : (buffer_) -> outStream.write _encoder.write buffer_


	ttyWidth = outStream.columns ? outStream.getWindowSize()[0]

	left                ?= 0
	right               ?= ttyWidth
	right < 0 and right = ttyWidth + right
	width               = right - left

	mode ?= 'soft'

	if mode is 'container'
		return do ->
			end      : -> outStream._isStdio or outStream.end()
			getWidth : -> ttyWidth
			write    : (buffer_) -> outStream.write _encoder.write buffer_

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
		write: (buffer_, write_ = yes) ->
			lines = []
			line = margin[0..left - 1]
			lineWidth = 0
			indent = 0

			tokens = _encoder.write buffer_
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
						line      += margin[0..3]
						lineWidth += 4
						indent    += 4
						return

					else if mode is 'soft' and token_.length > width - indent
						format.linefit token_[0..width - indent - 4] + "..."

					else if lineWidth + token_.length > width
						line.replace postSpaceRegex, ''
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

			lines.push line if line isnt ''

			if write_
				outStream.write lines.join '\n'
			else
				lines.join '\n'

truwrap.getName = ->
	return _package.name

truwrap.getVersion = (long = 1) ->
	switch long
		when 1 then "#{_package.version}"
		else "#{_package.name} v#{_package.version}"

truwrap.Image = require('./lib/image')
