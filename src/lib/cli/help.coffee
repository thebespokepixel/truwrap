'use strict'
###
 truwrap (v0.1.2-alpha.12) : Smart word wrap
 Command line help
###

_truwrap = require '../../index'
# is24bit = true if process.env.TERM_COLOR is '24 bit'

clr =
	grey:		"\x1b[38;2;100;100;100m"
	normal:	"\x1b[0;38;2;200;200;200m"

page =
	header:
		"""

			#{clr.normal}#{ _truwrap.getName() } #{clr.grey}v#{ _truwrap.getVersion() }#{clr.normal}

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
