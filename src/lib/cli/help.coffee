'use strict'
###
	truwrap
	Command line help
###

console = global.vConsole
trucolor = require 'trucolor'
truwrap = require '../..'
deepAssign = require 'deep-assign'
terminalFeatures = require 'term-ng'

_name = do truwrap.getName
_bin = do truwrap.getBin
_version = truwrap.getVersion 3
_description = do truwrap.getDescription

clr = deepAssign trucolor.simplePalette(), trucolor.bulk {},
	bright: 'bold rgb(255,255,255)'
	dark  : '#333'

module.exports = (yargs_, helpPage_) ->
	images = if terminalFeatures.images
		space : "\t"
		cc    : new truwrap.Image
			name   : 'logo'
			file   : __dirname + '/../../media/CCLogo.png'
			height : 3
	else
		space : ""
		cc    :
			render: -> ""

	header = ->
		[
			   "#{clr.title} #{_name}#{clr.title.out}"
			"#{images.space} #{_description}"
			"#{images.space} #{clr.grey}#{_version}#{clr.dark}"
		].join "\n"

	synopsis = """
		#{clr.title}Synopsis:#{clr.title.out}
		#{clr.command}cat #{clr.argument}inputFile #{clr.operator}| #{clr.command}#{_bin} #{clr.option}[options]
	"""
	usage = """
		#{clr.title}Usage:#{clr.title.out}
		Reads unformatted text from stdin and typographically applies paragraph wrapping it for the currently active tty.
	"""
	epilogue = """
		#{clr.title}#{_name}#{clr.title.out} is an open source component of CryptoComposite\'s toolset.
		#{clr.title}#{do truwrap.getCopyright}#{clr.title.out}. #{clr.grey}Released under the MIT License.
		#{clr.grey}Issues? #{do truwrap.getBugs}#{clr.normal}

	"""

	container = truwrap
		mode: 'container'
		outStream: process.stderr

	windowWidth = container.getWidth()

	renderer = truwrap
		left: 2
		right: 0
		outStream: process.stderr

	contentWidth = renderer.getWidth()

	yargs_.wrap(contentWidth)

	container.write '\n'
	container.write images.cc.render
		nobreak: false
		align: 2
	container.write header()
	renderer.break()
	container.write "–".repeat windowWidth
	renderer.break(2)
	renderer.write synopsis
	renderer.break(2)
	renderer.write yargs_.getUsageInstance().help()
	renderer.break()
	renderer.write usage
	renderer.break(2)
	renderer.write epilogue
	renderer.break()
