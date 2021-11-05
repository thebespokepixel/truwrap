/* eslint unicorn/prefer-trim-start-end:0,unicorn/prefer-string-slice:0 */
/* ─────────────────────╮
 │ truwrap line fitting │
 ╰──────────────────────┴────────────────────────────────────────────────────── */

import ansiRegex from 'ansi-regex'

const newlineRegex = /^>\/\\\/\/__<$/
const tabRegex = /^>T\/\\B<$/

/**
 * Fit a line of text to settings
 * @private
 */
class LineFitter {
	/**
	 * Create a LineFitter instance
	 * @param  {number[]} options [margin, width, tab-width] as an array.
	 */
	constructor(options) {
		[
			this.mode,
			this.margin,
			this.desiredWidth,
			this.tabWidth,
		] = options

		this.lineTokens = [this.margin]
		this.cursor = 0
		this.lineBlock = false
	}

	/**
	 * Add a [TAB] character token to the line.
	 * @return {string} Tab -> n-spaces.
	 */
	createTab() {
		const width = this.tabWidth - (this.cursor % this.tabWidth) || 4
		this.cursor += width
		return ' '.repeat(width)
	}

	/**
	 * Add a token to the line.
	 * @param {string} token The word token to add.
	 * @returns {boolean} Causes newline.
	 */
	add(token) {
		if (newlineRegex.test(token)) {
			return true
		}

		if (ansiRegex().test(token)) {
			this.lineTokens.push(token)
			return false
		}

		if (tabRegex.test(token)) {
			this.lineTokens.push(this.createTab())
			return false
		}

		const overlap = this.cursor + token.trimEnd().length - this.desiredWidth

		switch (this.mode) {
			case 'hard':
				if (overlap > 0) {
					const head = token.trimEnd().substring(0, token.length - overlap)
					const tail = token.substring(token.length - overlap)
					this.lineTokens.push(head)
					this.cursor += head.length
					return tail === ' ' ? '' : tail
				}

				this.lineTokens.push(token)
				this.cursor += token.length
				return false

			case 'keep':
				this.lineTokens.push(token)
				this.cursor += token.length
				return false

			default:
				if (overlap > 0 && this.cursor > 0) {
					return token
				}

				this.lineTokens.push(token)
				this.cursor += token.length
				return false
		}
	}

	/**
	 * Return a string of the current line.
	 * @return {string} The current line.
	 */
	toString() {
		return this.lineTokens.join('')
	}
}

/**
 * Creates a line fitter - a new line of wrapped text..
 * @private
 * @param      {string}      mode      The wrapping mode
 * @param      {string}      margin    The left margin, made up of spaces
 * @param      {number}      width     The width the line can take up
 * @param      {number}      tabWidth  Desired TAB width
 * @return     {LineFitter}  The line fitter.
 */
export default function createLineFitter(mode, margin, width, tabWidth) {
	return new LineFitter([mode, margin, width, tabWidth])
}
