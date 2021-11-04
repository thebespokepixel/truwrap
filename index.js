import columnify from 'columnify';
import { createSelector } from '@thebespokepixel/n-selector';
import ansiRegex from 'ansi-regex';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { statSync, readFileSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import _ from 'lodash';

const tabRegex$1 = /\t/g;
const newlineRegex$1	= /\n/g;
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
		})();
	}
	/**
	 * Processes the source text into tokenised Arrays.
	 * @param  {string} source - The text to process
	 * @return {Array} An array of chuncked tokens.
	 */
	process(source) {
		return source
			.replace(newlineRegex$1, '\u0000>/\\//__<\u0000')
			.replace(tabRegex$1, '\u0000>T/\\B<\u0000')
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
function createTokeniser(tokenisingRegex) {
	return new Tokeniser(tokenisingRegex)
}

const newlineRegex = /^>\/\\\/\/__<$/;
const tabRegex = /^>T\/\\B<$/;
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
			this.tabWidth,
		] = options;
		this.lineTokens = [this.margin];
		this.cursor = 0;
		this.lineBlock = false;
	}
	/**
	 * Add a [TAB] character token to the line.
	 * @return {string} Tab -> n-spaces.
	 */
	createTab() {
		const width = this.tabWidth - (this.cursor % this.tabWidth) || 4;
		this.cursor += width;
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
			this.lineTokens.push(token);
			return false
		}
		if (tabRegex.test(token)) {
			this.lineTokens.push(this.createTab());
			return false
		}
		const overlap = this.cursor + token.trimEnd().length - this.desiredWidth;
		switch (renderMode.selected) {
			case 'hard':
				if (overlap > 0) {
					const head = token.trimEnd().substring(0, token.length - overlap);
					const tail = token.substring(token.length - overlap);
					this.lineTokens.push(head);
					this.cursor += head.length;
					return tail === ' ' ? '' : tail
				}
				this.lineTokens.push(token);
				this.cursor += token.length;
				return false
			case 'keep':
				this.lineTokens.push(token);
				this.cursor += token.length;
				return false
			default:
				if (overlap > 0 && this.cursor > 0) {
					return token
				}
				this.lineTokens.push(token);
				this.cursor += token.length;
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
 * @param      {string}      margin    The left margin, made up of spaces
 * @param      {number}      width     The width the line can take up
 * @param      {number}      tabWidth  Desired TAB width
 * @return     {LineFitter}  The line fitter.
 */
function createLineFitter(margin, width, tabWidth) {
	return new LineFitter([margin, width, tabWidth])
}

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
		this.margin = ' '.repeat(left);
		this.desiredWidth = width;
		this.tabWidth = tabWidth;
		this.tokeniser = createTokeniser(tokenRegex);
	}
	/**
	 * Apply instance settings to source text.
	 * @param  {string} text - The text that require wrapping to the view.
	 * @return {string}      - Text with wrapping applied.
	 */
	wrap(text) {
		this.lines = [];
		const tokens = this.tokeniser.process(text);
		let currentLine = createLineFitter(this.margin, this.desiredWidth, this.tabWidth);
		while (tokens.length > 0) {
			const overflow = currentLine.add(tokens.shift());
			if (overflow) {
				this.lines.push(currentLine.toString());
				currentLine = createLineFitter(this.margin, this.desiredWidth, this.tabWidth);
				if (overflow !== true && overflow !== false) {
					tokens.unshift(overflow);
				}
			}
		}
		this.lines.push(currentLine.toString());
		return this.lines.map(line => this.tokeniser.restore(line)).join('\n')
	}
}
/**
 * Creates a wrap tool.
 * @private
 * @param      {Object}    options  The options
 * @return     {WrapTool}  The wrap tool.
 */
function createWrapTool(options) {
	return new WrapTool(options)
}

const prefix = '\u001B]1337;File=inline=1;';
const suffix = '\u0007';
const broken = join(dirname(fileURLToPath(import.meta.url)), '/media/broken.png');
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
		const extName = extname(file);
		const fileName = name || basename(file, extName);
		const lineNameBase64 = Buffer.from(fileName).toString('base64');
		this.config = `width=${width};height=${height};name=${lineNameBase64}`;
		this.filePath = (function () {
			try {
				if (statSync(file).isFile()) {
					return file
				}
			} catch (error) {
				switch (error.code) {
					case 'ENOENT':
						console.error('Warning:', `${file} not found.`);
						break
					default:
						console.error(error);
				}
				return broken
			}
		})();
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
		const {align, stretch = false, nobreak, spacing = ''} = options;
		const content = Buffer.from(readFileSync(this.filePath));
		const aspect = stretch ? 'preserveAspectRatio=0;' : '';
		const linebreak = nobreak ? '' : '\n';
		const newline = align > 1 ? `\u001BH\u001B[${align}A` : linebreak;
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
function createImage(source) {
	return new Image(source)
}

/**
 * Organise a block of delimited text into a panel
 * @private
 * @param  {string} buffer_ Input plain text.
 * @param  {string} delimiter_ Field delimiter.
 * @param  {number} width_ Panel width.
 * @return {Object} The columnify configuration.
 */
function panel(buffer_, delimiter_, width_) {
	let longIdx = 0;
	let maxCols = 0;
	const spacerCols = [];
	const tableData = [];
	_.forEach(_.split(buffer_.trim(), '\n'), (row, rowIdx) => {
		const columnData = {};
		_.forEach(_.split(row, delimiter_), (col, colIdx) => {
			if (col === ':space:') {
				spacerCols.push(colIdx);
				columnData[`spacer${colIdx}`] = ' ';
			} else if (spacerCols.includes(colIdx)) {
				columnData[`spacer${colIdx}`] = ' ';
			} else {
				columnData[`c${colIdx}`] = col;
			}
			if (colIdx > maxCols) {
				maxCols = colIdx;
				longIdx = rowIdx;
			}
		});
		tableData.push(columnData);
	});
	const setSpacer = (spacerSize, min) =>
		_.max([
			Math.floor((width_
				- (spacerCols.length * spacerSize))
				/ (maxCols - spacerCols.length + 1),
			),
			min,
		]) - 1;
	const configuration = {};
	const max = setSpacer(16, 5);
	const min = setSpacer(4, 3);
	for (const idx of Object.keys(tableData[longIdx])) {
		if (idx.includes('spacer')) {
			configuration[idx] = {
				maxWidth: 16,
				minWidth: 4,
			};
		} else {
			configuration[idx] = {
				maxWidth: _.max([min, max]),
				minWidth: _.min([min, max]),
			};
		}
	}
	return {
		content: tableData,
		configuration,
	}
}

/**
 * Create an n-selector for module modes
 *
 * @type       {Function}
 */
const renderMode = createSelector([
	'soft',
	'hard',
	'keep',
	'container'
], 0, 'configuration_mode');
/**
 * Truwrap - take input from write() and composed a wrapped text block.
 *
 * @class      Truwrap (name)
 */
class Truwrap {
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
		this.outStream = outStream;
		this.buffer = '';
		this.mode = mode;
		this.ttyActive = Boolean(width || (outStream && outStream.isTTY) || /keep|container/.test(mode));
		this.ttyWidth = (() => {
			if (width) {
				return width
			}
			if (outStream && outStream.isTTY) {
				return outStream.columns || outStream.getWindowSize()[0]
			}
			return 80
		})();
		this.viewWidth = (() => {
			if (this.ttyWidth - left - right > 1) {
				return this.ttyWidth - left - right
			}
			return 2
		})();
		renderMode.select(mode);
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
		})();
	}
	/**
	 * End a block, setting blocking mode and flushing buffers if needed.
	 *
	 * @return     {string}  The wrapped output, has side effect of writing to stream if defined.
	 */
	end() {
		if (this.outStream) {
			this.outStream.end();
		}
		const output = this.buffer;
		this.buffer='';
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
		})();
		if (this.outStream) {
			this.outStream.write(content);
		}
		this.buffer += content;
		return this
	}
	/**
	 * Generate linebreaks within this view
	 *
	 * @param  {number} newlines   number of new lines to add.
	 * @return {Object} this instance, to allow chaining
	 */
	break(newlines = 1) {
		const content = '\n'.repeat(newlines);
		if (this.outStream) {
			this.outStream.write(content);
		}
		this.buffer += content;
		return this
	}
	/**
	 * Similar to css' clear. Write a clearing newline to the stream.
	 *
	 * @return     {Object}  this instance, to allow chaining
	 */
	clear() {
		const content = '\n';
		if (this.outStream) {
			this.outStream.write(content);
		}
		this.buffer += content;
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
		})();
		if (this.outStream) {
			this.outStream.write(content);
		}
		this.buffer += content;
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
function truwrap(options) {
	return new Truwrap(options)
}

export { Truwrap, createImage, panel as parsePanel, renderMode, truwrap };
