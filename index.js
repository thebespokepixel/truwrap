import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import columnify from 'columnify';
import { osLocaleSync } from 'os-locale';
import { createConsole } from 'verbosity';
import { TemplateTag, replaceSubstitutionTransformer, stripIndent } from 'common-tags';
import meta from '@thebespokepixel/meta';
import { createSelector } from '@thebespokepixel/n-selector';
import _ from 'lodash';
import { simple, palette } from 'trucolor';
import { statSync, readFileSync } from 'node:fs';
import ansiRegex from 'ansi-regex';

const tabRegex$1 = /\t/g;
const newlineRegex$1	= /\n/g;
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
	 * @param  {String} source - Line to process
	 * @return {String} - Process line
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
 * @param      {<type>}     tokenisingRegex  The tokenising regular expression
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
		console.debug('[Line]', '▸', this.cursor);
	}
	/**
	 * Add a [TAB] character token to the line.
	 * @return {string} Tab -> n-spaces.
	 */
	createTab() {
		const width = this.tabWidth - (this.cursor % this.tabWidth) || 4;
		this.cursor += width;
		console.debug('[TAB', width, ']', '▸', this.cursor);
		return ' '.repeat(width)
	}
	/**
	 * Add a token to the line.
	 * @param {string} token The word token to add.
	 * @returns {Boolean} Causes newline.
	 */
	add(token) {
		if (newlineRegex.test(token)) {
			console.debug('[Newline]', '▸', this.cursor);
			return true
		}
		if (ansiRegex().test(token)) {
			console.debug('[ANSI Token]', '▸', this.cursor);
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
					console.debug('[Token][Head]', head, '▸', this.cursor);
					console.debug('[Token][Tail]', tail);
					return tail === ' ' ? '' : tail
				}
				this.lineTokens.push(token);
				this.cursor += token.length;
				console.debug('[Token]', token, '▸', this.cursor);
				return false
			case 'keep':
				this.lineTokens.push(token);
				this.cursor += token.length;
				console.debug('[Token]', token, '▸', this.cursor);
				return false
			default:
				if (overlap > 0 && this.cursor > 0) {
					return token
				}
				this.lineTokens.push(token);
				this.cursor += token.length;
				console.debug('[Token]', token, '▸', this.cursor);
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
 * @param      {String}      margin    The left margin, made up of spaces
 * @param      {Number}      width     The width the line can take up
 * @param      {Number}      tabWidth  Desired TAB width
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
	 * @param  {Number} $0.left       - The left margins
	 * @param  {Number} $0.width      - The width of the view, in chars
	 * @param  {Regex}  $0.tokenRegex - An optional regex passed to the Tokeniser
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
	 * @param  {String} text - The text that require wrapping to the view.
	 * @return {String}      - Text with wrapping applied.
	 */
	wrap(text) {
		this.lines = [];
		const tokens = this.tokeniser.process(text);
		let currentLine = createLineFitter(this.margin, this.desiredWidth, this.tabWidth);
		while (tokens.length > 0) {
			const overflow = currentLine.add(tokens.shift());
			if (overflow) {
				this.lines.push(currentLine.toString());
				console.debug('Line complete:', currentLine.toString());
				currentLine = createLineFitter(this.margin, this.desiredWidth, this.tabWidth);
				if (overflow !== true && overflow !== false) {
					console.debug('╰ Overflow:', overflow);
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

const clr = _.merge(
	simple({format: 'sgr'}),
	palette({format: 'sgr'},
	{
		title: 'bold #9994D1',
		bright: 'bold rgb(255,255,255)',
		dark: '#333',
	}),
);
const colorReplacer = new TemplateTag(
	replaceSubstitutionTransformer(
		/([a-zA-Z]+?)[:/|](.+)/,
		(match, colorName, content) => `${clr[colorName]}${content}${clr[colorName].out}`,
	),
);

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
	 * @param  {String} $0.width  - Can be X(chars), Xpx(pixels),
	 *                              X%(% width of window) or 'auto'
	 * @param  {String} $0.height - Can be Y(chars), Ypx(pixels),
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
						console.warn('Warning:', `${file} not found.`);
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
	 * @property {Boolean} stretch - Do we stretch the image to match the width
	 *                               and height.
	 * @property {Boolean} nobreak - Do we clear the image with a newline?
	 * @return {string} The string to insert into the output buffer, with base64
	 *                  encoded image.
	 */
	render(options) {
		const {align, stretch = false, nobreak} = options;
		const content = Buffer.from(readFileSync(this.filePath));
		const aspect = stretch ? 'preserveAspectRatio=0;' : '';
		const linebreak = nobreak ? '' : '\n';
		const newline = align > 1 ? `\u001BH\u001B[${align}A` : linebreak;
		return `${prefix}${aspect}size=${content.length}${this.config}:${
			content.toString('base64')
		}${suffix}${newline}`
	}
}
/**
 * Creates an image.
 * @private
 * @param      {String}  source  The source
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
 * @param  {Number} width_ Panel width.
 * @return {object} The columnify configuration.
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

const console = createConsole({outStream: process.stderr});
const locale = osLocaleSync();
const metadata = meta(dirname(fileURLToPath(import.meta.url)));
const renderMode = createSelector([
	'soft',
	'hard',
	'keep',
	'container'
], 0, 'configuration_mode');
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
 * @param  {object}          options            options object
 * @param  {number}          options.left       Left margin.
 * @param  {number}          options.right      Right margin.
 * @param  {number}          options.width      Manually set view width.
 * @param  {mode}            options.mode       [soft | hyphen | hard | keep | container]
 * @param  {number}          options.tabWidth   Desired width of TAB character.
 * @param  {Stream.writable} options.outStream  Where to direct output.
 * @param  {Regexp}          options.tokenRegex Override the tokenisers regexp.
 * @return {api} A truwrap api instance.
 */
function truwrap({
	left = 2,
	right = 2,
	width,
	mode = 'soft',
	tabWidth = 4,
	outStream = process.stdout,
	tokenRegex
}) {
	const ttyActive = Boolean(width || outStream.isTTY || /keep|container/.test(mode));
	const ttyWidth = (function () {
		if (width) {
			return width
		}
		if (outStream.isTTY) {
			return outStream.columns || outStream.getWindowSize()[0]
		}
		return Infinity
	})();
	const viewWidth = (function () {
		if (ttyWidth - left - right > 1) {
			return ttyWidth - left - right
		}
		return 2
	})();
	renderMode.select(mode);
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
	})();
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
				outStream.write('\n');
			} else {
				outStream.end();
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
		 * @param {panelObject} content - Object for columnify
		 * @param {Object} configuration - Configuration for columnify
		 * @return {String} - The rendered panel.
		 */
		panel(content, configuration) {
			if (outStream._isStdio) {
				outStream.write(columnify(content, configuration));
			}
			return this
		},
		/**
		 * Generate linebreaks within this view
		 * @function
		 * @param {Number} newlines - number of new lines to add.
		 * @return {api} has side effect of writing to stream.
		 */
		break(newlines = 1) {
			outStream.write('\n'.repeat(newlines));
			return this
		},
		/**
		 * Similar to css' clear. Write a clearing newline to the stream.
		 * @function
		 * @return {api} has side effect of writing to stream.
		 */
		clear() {
			outStream.write('\n');
			return this
		},
		/**
		 * Write text via the wrapping logic
		 * @function
		 * @param {String} text - The raw, unwrapped test to wrap.
		 * @return {api} has side effect of writing to stream.
		 */
		write(text) {
			outStream.write(text);
			return this
		}
	};
	switch (true) {
		case !ttyActive:
			console.info(colorReplacer`${'yellow|Non-TTY'}: width: Infinity`);
			/**
			 * @name noTTY
			 * @private
			 * @returns {api} - A version of the API when no TTY is connected.
			 */
			return Object.assign(Object.create(api), {
				getWidth: () => ttyWidth
			})
		case renderMode.selected === 'container':
			console.info(`Container: width: ${width}, render mode: ${renderMode.selected}`);
			/**
			 * @name container
			 * @private
			 * @returns {api} - A zero-margin container that content can be flowed into.
			 */
			return Object.assign(Object.create(api), {
				getWidth: () => ttyWidth
			})
		default:
			console.info(stripIndent(colorReplacer)`
				${'green|Renderer'}:
				  mode ▸ ${renderMode.selected} [${locale}]
				  ┆ ${left} ◂├╌╌╌╌ ${viewWidth} ╌╌╌╌┤▸ ${right} ┆
			`, '\n');
			/**
			 * @name wrap
			 * @private
			 * @returns {api} - The wrapping API.
			 */
			return Object.assign(Object.create(api), {
				getWidth: () => viewWidth,
				panel(content, configuration) {
					outStream.write(viewHandler.wrap(columnify(content, configuration)));
					return this
				},
				write(text) {
					outStream.write(viewHandler.wrap(text));
					return this
				}
			})
	}
}

export { console, createImage, locale, metadata, panel as parsePanel, renderMode, truwrap };
