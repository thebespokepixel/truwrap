'use strict'
###
 truwrap (v0.0.5-40) : Smart word wrap
 Command line help
###

_package = require '../../package.json'
_wrap = require '../../index'

clr =
	grey:		"\x1b[38;2;100;100;100m"
	normal:	"\x1b[0;38;2;200;200;200m"

img =
	cc: new _wrap.image
		name: 'logo'
		file: __dirname + '/../../media/CCLogo.png'
		height: 3

page =
	header: "#{clr.normal}TruWrap\n\t#{clr.grey}v#{_package.version}#{clr.normal}\n"
	usage:
		"""

		Usage:

			wrap [OPTIONS]

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
module.exports = (yargs_, helpPage_) ->
	container = _wrap
		mode: 'container'
		outStream: process.stderr
	windowWidth = container.getWidth()

	renderer = _wrap
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
	yargs_
		.wrap (container.isTTY and windowWidth -1 or 0)
		.showHelp container.write

	container.write "\n"
