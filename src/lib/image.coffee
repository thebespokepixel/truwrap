'use strict'
###
	truwrap (v0.0.8)
	Read an image into the console. Currently for iTerm2.9.x nightlies.
###
fs = require 'fs'
path = require 'path'

class Image

	prefix: "\x1b]1337;File=inline=1;"
	suffix: "\x07"

	constructor: (source_) ->
		{file, name, @width, @height} = source_

		@data = new Buffer fs.readFileSync fs.realpathSync file

		@width ?= 'auto' if @height?
		@height ?= 'auto' if @width?

		@config = "size=#{@data.length};"
		@config += "width=#{@width};" if @width?
		@config += "height=#{@height};" if @height?
		@config += "name=" + new Buffer(name or path.basename file).toString 'base64'

	render: (options_ = {}) ->
		{align, stretch, nobreak} = options_

		aspect = 'preserveAspectRatio=0;' if stretch?
		aspect ?= ''

		newline = "\n" if not nobreak?
		newline = "\x1bH\x1b[#{align}A" if align?
		newline ?= ''

		"#{@prefix}#{aspect}#{@config}:#{@data.toString 'base64'}#{@suffix}#{newline}"

	stream: (wStream = process.stdout, options_ = {}) ->
		# if not wStream.writable
		# 	throw "Output stream is not writable."

		wStream.write @render options_

module.exports = Image

