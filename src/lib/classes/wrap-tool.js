/* ────────╮
 │ truwrap │ WrapTool
 ╰─────────┴─────────────────────────────────────────────────────────────────── */

import {console} from '../../index.js'
import createTokeniser from './tokeniser.js'
import createLineFitter from './line-fitter.js'

/**
 * Class that actually wraps the text.
 * @private
 */
class WrapTool {
	/**
	 * Create a new line wrapping tool.
	 * @param  {options} $0 - The supplied options
	 * @param  {number} $0.left       - The left margins
	 * @param  {number} $0.width      - The width of the view, in chars
	 * @param  {RegExp}  $0.tokenRegex - An optional regex passed to the Tokeniser
	 */
	constructor({
		left,
		width,
		tabWidth,
		tokenRegex,
	}) {
		this.margin = ' '.repeat(left)
		this.desiredWidth = width
		this.tabWidth = tabWidth
		this.tokeniser = createTokeniser(tokenRegex)
	}

	/**
	 * Apply instance settings to source text.
	 * @param  {string} text - The text that require wrapping to the view.
	 * @return {string}      - Text with wrapping applied.
	 */
	wrap(text) {
		this.lines = []
		const tokens = this.tokeniser.process(text)

		let currentLine = createLineFitter(this.margin, this.desiredWidth, this.tabWidth)

		while (tokens.length > 0) {
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
		return this.lines.map(line => this.tokeniser.restore(line)).join('\n')
	}
}

/**
 * Creates a wrap tool.
 * @private
 * @param      {object}    options  The options
 * @return     {WrapTool}  The wrap tool.
 */
export default function createWrapTool(options) {
	return new WrapTool(options)
}
