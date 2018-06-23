/* ─────────────────────╮
 │ truwrap line fitting │
 ╰──────────────────────┴────────────────────────────────────────────────────── */

import ansiRegex from 'ansi-regex'
import {console, renderMode} from '../../main'

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
			this.margin,
			this.desiredWidth,
			this.tabWidth
		] = options

		this.lineTokens = [this.margin]
		this.cursor = 0
		this.lineBlock = false
		console.debug('[Line]', '▸', this.cursor)
	}

	/**
	 * Add a [TAB] character token to the line.
	 * @return {string} Tab -> n-spaces.
	 */
	createTab() {
		const width = this.tabWidth - (this.cursor % this.tabWidth) || 4
		this.cursor += width
		console.debug('[TAB', width, ']', '▸', this.cursor)
		return ' '.repeat(width)
	}

	/**
	 * Add a token to the line.
	 * @param {string} token The word token to add.
	 * @returns {Boolean} Causes newline.
	 */
	add(token) {
		if (newlineRegex.test(token)) {
			console.debug('[Newline]', '▸', this.cursor)
			return true
		}

		if (ansiRegex().test(token)) {
			console.debug('[ANSI Token]', '▸', this.cursor)
			this.lineTokens.push(token)
			return false
		}

		if (tabRegex.test(token)) {
			this.lineTokens.push(this.createTab())
			return false
		}

		const overlap = this.cursor + token.trimRight().length - this.desiredWidth

		switch (renderMode.selected) {
			case 'hard':
				if (overlap > 0) {
					const head = token.trimRight().substring(0, token.length - overlap)
					const tail = token.substring(token.length - overlap)
					this.lineTokens.push(head)
					this.cursor += head.length
					console.debug('[Token][Head]', head, '▸', this.cursor)
					console.debug('[Token][Tail]', tail)
					return tail === ' ' ? '' : tail
				}

				this.lineTokens.push(token)
				this.cursor += token.length
				console.debug('[Token]', token, '▸', this.cursor)
				return false

			case 'keep':
				this.lineTokens.push(token)
				this.cursor += token.length
				console.debug('[Token]', token, '▸', this.cursor)
				return false

			default:
				if (overlap > 0) {
					if (this.cursor > 0) {
						return token
					}
				}

				this.lineTokens.push(token)
				this.cursor += token.length
				console.debug('[Token]', token, '▸', this.cursor)
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
 * Create a new line of wrapped text.
 * @private
 * @param  {String} margin   - The left margin, made up of spaces
 * @param  {Number} width    - The width the line can take up
 * @param  {Number} tabWidth - Desired TAB width
 * @return {LineFitter} The LineFitter instance.
 */
export default (margin, width, tabWidth) =>
	new LineFitter([margin, width, tabWidth])
