/* ──────────────────╮
 │ truwrap tokeniser │ Handle the tokenisation of source text
 ╰───────────────────┴───────────────────────────────────────────────────────── */

import ansiRegex from 'ansi-regex'
import {renderMode} from '../../main'

const tabRegex = /\t/g
const newlineRegex	= /\n/g

/**
 * Tokenises text into words, taking into account newlines, punctuation and ANSI.
 * @private
 */
class Tokeniser {
	/**
	 * Create a new tokeniser
	 * @param  {Regexp} tokenisingRegex - The regex that forms the word boundaries.
	 */
	constructor(tokenisingRegex) {
		this.tokenisingRegex = tokenisingRegex || (function () {
			switch (renderMode.selected) {
				case 'keep':
					return /^.*$/mg
				default:
					return /\S+\s+/g
			}
		})()
	}

	/**
	 * Processes the source text into tokenised Arrays.
	 * @param  {string} source - The text to process
	 * @return {Array} An array of chuncked tokens.
	 */
	process(source) {
		return source
			.replace(newlineRegex, '\u0000>/\\//__<\u0000')
			.replace(tabRegex, '\u0000>T/\\B<\u0000')
			.replace(ansiRegex(), '\u0000$&\u0000')
			.replace(this.tokenisingRegex, '\u0000$&\u0000')
			.split('\u0000')
			.filter(token => token !== '')
	}

	/**
	 * Reconstruct the line, flush.ing any remaining tokens
	 * @param  {String} source - Line to process
	 * @return {String} - Process line
	 */
	restore(source) {
		return source
			.replace(/>\/\\\/\/__</g, '\n')
			.trimRight()
	}
}

/**
 * Create a new Tokeniser instance
 * @private
 * @param {Regexp} tokenisingRegex - The regex that forms the word boundaries.
 * @see {@link Tokeniser}
 * @return {Tokeniser} A tokeniser instance.
 */
export default tokenisingRegex => new Tokeniser(tokenisingRegex)
