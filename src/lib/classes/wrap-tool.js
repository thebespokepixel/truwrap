/* ────────╮
 │ truwrap │ WrapTool
 ╰─────────┴─────────────────────────────────────────────────────────────────── */

import {console} from '../../index'
import createTokeniser from './tokeniser'
import createLineFitter from './line-fitter'

/**
 * Class that actually wraps the text.
 * @private
 */
class WrapTool {
	/**
	 * Create a new line wrapping tool.
	 * @param  {options} $0 - The supplied options
	 * @param  {Number} $0.left       - The left margins
	 * @param  {Number} $0.width      - The width of the view, in chars
	 * @param  {Regex}  $0.tokenRegex - An optional regex passed to the Tokeniser
	 * @return {WrapTool} A configured WrapTool.
	 */
	constructor({
			left,
			width,
			tabWidth,
			tokenRegex
		}) {
		this.margin = ' '.repeat(left)
		this.desiredWidth = width
		this.tabWidth = tabWidth
		this.tokeniser = createTokeniser(tokenRegex)
	}

	/**
	 * Apply instance settings to source text.
	 * @param  {String} text - The text that require wrapping to the view.
	 * @return {String}      - Text with wrapping applied.
	 */
	wrap(text) {
		this.lines = []
		const tokens = this.tokeniser.process(text)

		let currentLine = createLineFitter(this.margin, this.desiredWidth, this.tabWidth)

		while (tokens.length) {
			const overflow = currentLine.add(tokens.shift())
			if (overflow) {
				this.lines.push(currentLine.toString())
				console.debug('Line complete:', currentLine.toString())
				currentLine = createLineFitter(this.margin, this.desiredWidth, this.tabWidth)
				if (overflow !== true && overflow !== false) {
					console.debug('╰ Overflow:', overflow)
					tokens.unshift(overflow)
				}
			}
		}
		this.lines.push(currentLine.toString())
		return this.lines.map(this.tokeniser.restore).join('\n')
	}
}

/**
 * Create a WrapTool instance
 * @param  {options} options - Provided options
 * @private
 * @return {WrapTool} A configured tool.
 */
export default options => new WrapTool(options)
