/* ────────╮
 │ truwrap │ Smarter 24bit SGR aware console text wrapping
 ╰─────────┴─────────────────────────────────────────────────────────────────── */

import {resolve} from 'path'
import readPkg from 'read-pkg'
import columnify from 'columnify'
import osLocale from 'os-locale'
import {createConsole} from 'verbosity'
import {stripIndent} from 'common-tags'
import meta from '@thebespokepixel/meta'
import {createSelector} from '@thebespokepixel/n-selector'

import createWrapTool from './lib/classes/wrap-tool'
import {colorReplacer} from './lib/colour'
import createImage from './lib/classes/image'
import parsePanel from './lib/classes/panel'

export const console = createConsole({outStream: process.stderr})
export const pkg = readPkg.sync(resolve(__dirname, '..'))
export const locale = osLocale.sync()
export const metadata = meta(__dirname)
export const renderMode = createSelector([
	'soft',
	'hard',
	'keep',
	'container'
], 0, 'configuration_mode')

/**
 * Throw a error if a method remains unimplemented
 * @private
 * @return {undefined}
 */
function unimplemented() {
	throw new Error('Unimplemented.')
}

/**
 * Create a text wrapping instance.
 *
 * @param  {Object}          $0            options object
 * @param  {Number}          $0.left       Left margin.
 * @param  {Number}          $0.right      Right margin.
 * @param  {Number}          $0.width      Manually set view width.
 * @param  {mode}            $0.mode       [soft | hyphen | hard | keep | container]
 * @param  {Number}          $0.tabWidth   Desired width of TAB character.
 * @param  {Stream.writable} $0.outStream  Where to direct output.
 * @param  {Regexp}          $0.tokenRegex Override the tokenisers regexp.
 * @return {api} A truwrap api instance.
 */
export function truwrap({
	left = 2,
	right = 2,
	width,
	mode = 'soft',
	tabWidth = 4,
	outStream = process.stdout,
	tokenRegex
}) {
	const ttyActive = Boolean(width || outStream.isTTY || /keep|container/.test(mode))

	const ttyWidth = (function () {
		if (width) {
			return width
		} else if (outStream.isTTY) {
			return outStream.columns || outStream.getWindowSize()[0]
		}
		return Infinity
	})()

	const viewWidth = (function () {
		if (ttyWidth - left - right > 1) {
			return ttyWidth - left - right
		}
		return 2
	})()

	renderMode.select(mode)

	const viewHandler = (function () {
		if (ttyActive && mode !== 'container') {
			return createWrapTool({
				left,
				width: viewWidth,
				tabWidth,
				tokenRegex
			})
		}
		return {}
	})()

	/**
	 * Truwap pulic API
	 * @public
	 */
	const api = {

		/**
		 * End a block, setting blocking mode and flushing buffers if needed.
		 * @function
		 * @return {undefined} has side effect of writing to stream
		 */
		end() {
			if (outStream._isStdio) {
				outStream.write('\n')
			} else {
				outStream.end()
			}
		},
		/**
		 * Fetch the width in characters of the wrapping view.
		 * @function
		 * @return {Number} wrapping width
		 */
		getWidth: unimplemented,

		/**
		 * Create a multicolumn panel within this view
		 * @function
		 * @param {panelObject} panel - Object for columnify
		 * @return {String} - The rendered panel.
		 */
		panel(content, configuration) {
			if (outStream._isStdio) {
				outStream.write(columnify(content, configuration))
			}
		},

		/**
		 * Generate linebreaks within this view
		 * @function
		 * @param {Number} newlines - number of new lines to add.
		 * @return {api} has side effect of writing to stream.
		 */
		break: unimplemented,

		/**
		 * Similar to css' clear. Write a clearing newline to the stream.
		 * @function
		 * @return {api} has side effect of writing to stream.
		 */
		clear: unimplemented,

		/**
		 * Write text via the wrapping logic
		 * @function
		 * @param {String} text - The raw, unwrapped test to wrap.
		 * @return {api} has side effect of writing to stream.
		 */
		write: unimplemented
	}

	switch (true) {
		case !ttyActive:
			console.info(colorReplacer`${'yellow|Non-TTY'}: width: Infinity`)

			/**
			 * @name noTTY
			 * @returns {api} - A version of the API when no TTY is connected.
			 */
			return Object.assign(Object.create(api), {
				getWidth: () => ttyWidth,
				break(newlines = 1) {
					outStream.write('\n'.repeat(newlines))
					return this
				},
				clear() {
					outStream.write('\n')
					return this
				},
				write(text) {
					outStream.write(text)
					return this
				}
			})

		case renderMode.selected === 'container':
			console.info(`Container: width: ${width}, render mode: ${renderMode.selected}`)

			/**
			 * @name container
			 * @returns {api} - A zero-margin container that content can be flowed into.
			 */
			return Object.assign(Object.create(api), {
				getWidth: () => ttyWidth,
				break(newlines = 1) {
					outStream.write('\n'.repeat(newlines))
					return this
				},
				clear() {
					outStream.write('\n')
					return this
				},
				write(text) {
					outStream.write(text)
					return this
				}
			})

		default:
			console.info(stripIndent(colorReplacer)`
				${'green|Renderer'}:
				  mode ▸ ${renderMode.selected} [${locale}]
				  ┆ ${left} ◂├╌╌╌╌ ${viewWidth} ╌╌╌╌┤▸ ${right} ┆
			`, '\n')

			/**
			 * @name wrap
			 * @returns {api} - The wrapping API.
			 */
			return Object.assign(Object.create(api), {
				getWidth: () => viewWidth,
				break(newlines = 1) {
					outStream.write('\n'.repeat(newlines))
					return this
				},
				panel(content, configuration) {
					outStream.write(viewHandler.wrap(columnify(content, configuration)))
					return this
				},
				clear() {
					outStream.write('\n')
					return this
				},
				write(text) {
					outStream.write(viewHandler.wrap(text))
					return this
				}
			})
	}
}

export {createImage, parsePanel}
