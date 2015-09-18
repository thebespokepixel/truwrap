'use strict'
###
 truwrap (v0.0.5) : Smart word wrap
 Command line help
###

_truwrap = require '../../index'

clr =
	grey:		"\x1b[38;2;100;100;100m"
	normal:	"\x1b[0;38;2;200;200;200m"

img =
	cc: new _truwrap.image
		name: 'logo'
		file: __dirname + '/../../media/CCLogo.png'
		height: 3

page =
	header:
		"""
			#{clr.normal}#{ _truwrap.getName() }
			#{clr.grey}v#{ _truwrap.getVersion() }#{clr.normal}
		"""
	usage:
		"""
		CLI Usage:
		  #{ _truwrap.getName() } [OPTIONS]

		"""
	epilogue:
		"""
			#{ _truwrap.getName() } is an open source component of CryptoComposite\'s toolset.
			© 2015 CryptoComposite. Released under the MIT License.
		"""

	examples: (width_) ->
		content: [
			Margin: " "
			Command: "truwrap"
			Result: ""
		,
			Command: ""
			Result: "\n\n"
		]
		layout:
			showHeaders: false
			config:
				Margin:
					minWidth: 2
					maxWidth: 2
				Command:
					minWidth: 30
					maxWidth: 80
				Result:
					maxWidth: width_-34



# Actually output a page...
module.exports = (yargs_) ->
	is24bit = true if process.env.TERM_COLOR is '24bit'

	container = _truwrap
		mode: 'container'
		outStream: process.stderr
	windowWidth = container.getWidth()

	unless is24bit
		yargs_.usage page.usage
		yargs_.epilogue page.epilogue
		yargs_.wrap(windowWidth).showHelp()

	renderer = _truwrap
		left: 2
		right: -2
		mode: 'soft'
		outStream: process.stderr
	contentWidth = renderer.getWidth()



	container.write "\n"
	container.write img.cc.render(nobreak: true, align: 1)
	container.write page.header
	# container.write spectrum windowWidth, "━"

	renderer.write page.usage
	container.write "Examples:\n" + renderer.panel page.examples windowWidth if page.examples?
	renderer.write "\n"
	renderer.write yargs_.wrap(container.isTTY and windowWidth -1 or 0).help

#		.wrap (container.isTTY and windowWidth -1 or 0)
#		.showHelp

	console.dir yargs_.help

	container.write "\n"
