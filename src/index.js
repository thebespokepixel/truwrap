/* ────────╮
 │ truwrap │ Smarter 24bit SGR aware console text wrapping
 ╰─────────┴─────────────────────────────────────────────────────────────────── */

import columnify from 'columnify'
import {createSelector} from '@thebespokepixel/n-selector'
import createWrapTool from './lib/wrap-tool.js'
import createImage from './lib/image.js'
import parsePanel from './lib/panel.js'

/**
 * Create an n-selector for module modes
 *
 * @type       {Function}
 */
export const renderMode = createSelector([
	'soft',
	'hard',
	'keep',
	'container'
], 0, 'configuration_mode')

/**
 * Truwrap - take input from write() and composed a wrapped text block.
 *
 * @class      Truwrap (name)
 */
export class Truwrap {
	/**
	 * The base Truwrap instance/api
	 *
	 * @param      {Object}           options                options object
	 * @param      {number}           [options.left=2]       Left margin.
	 * @param      {number}           [options.right=2]      Right margin.
	 * @param      {number}           options.width          Manually set view width.
	 * @param      {string}           [options.mode='soft']  [soft | hyphen | hard | keep | container
	 * @param      {number}           [options.tabWidth=4]   Desired width of TAB character.
	 * @param      {Stream.writable}  options.outStream      Where to direct output.
	 * @param      {Regexp}           options.tokenRegex     Override the tokenisers regexp.
	 */
	constructor({
		left = 2,
		right = 2,
		width,
		mode = 'soft',
		tabWidth = 4,
		outStream,
		tokenRegex
	}) {
		this.outStream = outStream
		this.buffer = ''
		this.mode = mode

		this.ttyActive = Boolean(width || (outStream && outStream.isTTY) || /keep|container/.test(mode))

		this.ttyWidth = (() => {
			if (width) {
				return width
			}

			if (outStream && outStream.isTTY) {
				return outStream.columns || outStream.getWindowSize()[0]
			}

			return 80
		})()

		this.viewWidth = (() => {
			if (this.ttyWidth - left - right > 1) {
				return this.ttyWidth - left - right
			}

			return 2
		})()

		renderMode.select(mode)

		this.viewHandler = (() => {
			if (this.ttyActive && mode !== 'container') {
				return createWrapTool({
					left,
					width: this.viewWidth,
					tabWidth,
					tokenRegex
				})
			}

			return {}
		})()
	}

	/**
	 * End a block, setting blocking mode and flushing buffers if needed.
	 *
	 * @return     {string}  The wrapped output, has side effect of writing to stream if defined.
	 */
	end() {
		if (this.outStream) {
			this.outStream.end()
			// if (this.outStream._isStdio) {
			// 	this.outStream.write('\n')
			// } else {
			// 	this.outStream.end()
			// }
		}

		const output = this.buffer
		this.buffer=''

		return output
	}

	/**
	 * Fetch the width in characters of the wrapping view.
	 *
	 * @return     {number}  The width.
	 */
	getWidth() {
		switch (true) {
			case !this.ttyActive:
				return this.ttyWidth
			case renderMode.selected === 'container':
				return this.ttyWidth
			default:
				return this.viewWidth
		}
	}

	/**
	 * Create a multicolumn panel within this view
	 *
	 * @param      {panelObject}  content_       Object for columnify
	 * @param      {Object}       configuration  Configuration for columnify
	 * @return     {Object}       this instance, to allow chaining
	 */
	panel(content_, configuration) {
		const content = (() => {
			switch (true) {
				case !this.ttyActive:
					return columnify(content_, configuration)
				case renderMode.selected === 'container':
					return columnify(content_, configuration)
				default:
					return this.viewHandler.wrap(columnify(content_, configuration))
			}
		})()

		if (this.outStream) {
			this.outStream.write(content)
		}

		this.buffer += content

		return this
	}

	/**
	 * Generate linebreaks within this view
	 *
	 * @param  {number} newlines   number of new lines to add.
	 * @return {Object} this instance, to allow chaining
	 */
	break(newlines = 1) {
		const content = '\n'.repeat(newlines)
		if (this.outStream) {
			this.outStream.write(content)
		}

		this.buffer += content

		return this
	}

	/**
	 * Similar to css' clear. Write a clearing newline to the stream.
	 *
	 * @return     {Object}  this instance, to allow chaining
	 */
	clear() {
		const content = '\n'
		if (this.outStream) {
			this.outStream.write(content)
		}

		this.buffer += content

		return this
	}

	/**
	 * Write text via the wrapping logic
	 *
	 * @param      {string}  content_  The content
	 * @return     {Object}  this instance, to allow chaining
	 */
	write(content_) {
		const content = (() => {
			switch (true) {
				case !this.ttyActive:
					return content_
				case renderMode.selected === 'container':
					return content_
				default:
					return this.viewHandler.wrap(content_)
			}
		})()

		if (this.outStream) {
			this.outStream.write(content)
		}

		this.buffer += content

		return this
	}
}

/**
 * Create a text wrapping instance.
 *
 * @param      {Object}           options                options object
 * @param      {number}           [options.left=2]       Left margin.
 * @param      {number}           [options.right=2]      Right margin.
 * @param      {number}           options.width          Manually set view width.
 * @param      {string}           [options.mode='soft']  [soft | hyphen | hard | keep | container
 * @param      {number}           [options.tabWidth=4]   Desired width of TAB character.
 * @param      {Stream.writable}  options.outStream      Where to direct output.
 * @param      {Regexp}           options.tokenRegex     Override the tokenisers regexp.
 * @return     {Truwrap}  { description_of_the_return_value }

 */
export function truwrap(options) {
	return new Truwrap(options)
}

export {createImage, parsePanel}
