'use strict'
###
 truwrap (v0.1.7) : Smart word wrap
 Command line help
###

_truwrap = require '../..'
is24bit = true if process.env.TERM_COLOR is '24 bit'

clr =
	grey:		"\x1b[38;2;100;100;100m"
	normal:	"\x1b[0;38;2;200;200;200m"

img =
	cc: new _truwrap.Image
		name: 'logo'
		file: __dirname + '/../../media/CCLogo.png'
		height: 3

if not is24bit
	clr =
		grey:	  "\x1b[38;5;247m"
		normal: "\x1b[37m"

page =
	header:
		"""

			#{clr.normal}#{ _truwrap.getName() } #{clr.grey}v#{ _truwrap.getVersion() }#{clr.normal}

			Reads unformatted text from stdin and typographically applies paragraph wrapping it for the currently active tty.

		"""
	usage:
		"""

			CLI Usage:
			#{clr.grey}Text stream (i.e cat) | #{clr.normal}#{ _truwrap.getName() } #{clr.grey}[OPTIONS]#{clr.normal}
		"""
	epilogue:
		"""
			#{ _truwrap.getName() } is an open source component of CryptoComposite\'s toolset.
			© 2015 CryptoComposite. #{clr.grey}Released under the MIT License.#{clr.normal}
		"""



# Actually output a page...
module.exports = (yargs_) ->

	renderer = _truwrap
		left: 2
		right: -2
		mode: 'soft'
		outStream: process.stderr

	contentWidth = renderer.getWidth()

	yargs_.usage page.usage
	yargs_.epilogue page.epilogue
	yargs_.wrap(contentWidth)

	renderer.write page.header
	renderer.write yargs_.help()
	renderer.end('\r')
