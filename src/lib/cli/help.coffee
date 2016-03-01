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

	header =
		->
			[
				   "#{clr.title} #{truwrap.getName()}#{clr.title.out}"
				"#{images.space} #{truwrap.getDescription()}"
				"#{images.space} #{clr.grey}#{truwrap.getVersion()}#{clr.dark}"
			].join "\n"
	synopsis = """
		#{clr.title}Synopsis:#{clr.title.out}
		#{clr.command}cat #{clr.argument}inputFile #{clr.operator}| #{clr.command}#{ truwrap.getName() } #{clr.option}[options]#{clr.option}
	"""
	usage = """
		#{clr.title}Usage:#{clr.title.out}
		Reads unformatted text from stdin and typographically applies paragraph wrapping it for the currently active tty.
	"""
	epilogue = """
		#{clr.title}#{ truwrap.getName() }#{clr.normal} is an open source component of CryptoComposite\'s toolset.
		#{clr.title}© 2014-2016 Mark Griffiths/CryptoComposite. #{clr.grey}Released under the MIT License.#{clr.normal}
		#{clr.grey}Documentation/Issues/Contributions @ http://github.com/MarkGriffiths/trucolor#{clr.normal}

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

	yargs_.usage ' '
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
	renderer.write yargs_.getUsageInstance().help()
	renderer.break()
	renderer.write usage
	renderer.break(2)
	renderer.write epilogue
	renderer.break()
