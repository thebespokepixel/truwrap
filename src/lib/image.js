/* ───────────────────────╮
 │ truwrap images handler │
 ╰────────────────────────┴───────────────────────────────────────────────────── */

import {Buffer} from 'node:buffer'
import {fileURLToPath} from 'node:url'
import {readFileSync, statSync} from 'node:fs'
import {dirname, basename, extname, join} from 'node:path'

const prefix = '\u001B]1337;File=inline=1;'
const suffix = '\u0007'
const broken = join(dirname(fileURLToPath(import.meta.url)), '/media/broken.png')

/**
 * Provides an image formatted for inclusion in the TTY
 * @private
 */
class Image {
	/**
	 * Create a new image reference
	 * @param  {string} $0.file   - The filename of the image.
	 * @param  {string} $0.name   - The name of the image
	 *                              [will be taken from image if missing]
	 * @param  {string} $0.width  - Can be X(chars), Xpx(pixels),
	 *                              X%(% width of window) or 'auto'
	 * @param  {string} $0.height - Can be Y(chars), Ypx(pixels),
	 *                              Y%(% width of window) or 'auto'
	 */
	constructor({
		file,
		name,
		width = 'auto',
		height = 'auto',
	}) {
		const extName = extname(file)
		const fileName = name || basename(file, extName)

		const lineNameBase64 = Buffer.from(fileName).toString('base64')

		this.config = `width=${width};height=${height};name=${lineNameBase64}`

		this.filePath = (function () {
			try {
				if (statSync(file).isFile()) {
					return file
				}
			} catch (error) {
				switch (error.code) {
					case 'ENOENT':
						console.error('Warning:', `${file} not found.`)
						break
					default:
						console.error(error)
				}

				return broken
			}
		})()
	}

	/**
	 * Load and render the image into the CLI
	 * @param  {Object} options    - The options to set
	 * @property {number} align    - The line count needed to realign the cursor.
	 * @property {boolean} stretch - Do we stretch the image to match the width
	 *                               and height.
	 * @property {boolean} nobreak - Do we clear the image with a newline?
	 * @return {string} The string to insert into the output buffer, with base64
	 *                  encoded image.
	 */
	render(options) {
		const {align, stretch = false, nobreak, spacing = ''} = options

		const content = Buffer.from(readFileSync(this.filePath))

		const aspect = stretch ? 'preserveAspectRatio=0;' : ''
		const linebreak = nobreak ? '' : '\n'
		const newline = align > 1 ? `\u001BH\u001B[${align}A` : linebreak

		return `${prefix}${aspect}size=${content.length}${this.config}:${
			content.toString('base64')
		}${suffix}${newline}${spacing}`
	}
}

/**
 * Creates an image.
 * @private
 * @param      {string}  source  The source
 * @return     {Image}   A configured (but not yet loaded) image.
 */
export default function createImage(source) {
	return new Image(source)
}
