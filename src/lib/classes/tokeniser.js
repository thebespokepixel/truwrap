/* eslint unicorn/prefer-trim-start-end:0 */
/* ──────────────────╮
 │ truwrap tokeniser │ Handle the tokenisation of source text
 ╰───────────────────┴───────────────────────────────────────────────────────── */

import ansiRegex from 'ansi-regex'
import {renderMode} from '../../index.js'

const tabRegex = /\t/g
const newlineRegex	= /\n/g

/**
 * Tokenises text into words, taking into account newlines, punctuation and ANSI.
 * @private
 */
class Tokeniser {
	/**
	 * Create a new tokeniser
	 * @param  {RegExp} tokenisingRegex - The regex that forms the word boundaries.
	 */
	constructor(tokenisingRegex) {
		this.tokenisingRegex = tokenisingRegex || (function () {
			switch (renderMode.selected) {
				case 'keep':
					return /^.*$/gm
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
	 * Reconstruct the line, flushing any remaining tokens
	 * @param  {string} source - Line to process
	 * @return {string} - Process line
	 */
	restore(source) {
		return source
			.replace(/>\/\\\/\/__</g, '\n')
			.trimEnd()
	}
}

/**
 * Creates a tokeniser.
 * @private
 * @param      {RegExp}     tokenisingRegex  The tokenising regular expression
 * @see {@link Tokeniser}
 * @return     {Tokeniser}  { A tokeniser instance. }
 */
export default function createTokeniser(tokenisingRegex) {
	return new Tokeniser(tokenisingRegex)
}
