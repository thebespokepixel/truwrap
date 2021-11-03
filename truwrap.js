#! /usr/bin/env node
import { format } from 'util';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import getStdin from 'get-stdin';
import updateNotifier from 'update-notifier';
import { TemplateTag, replaceSubstitutionTransformer, stripIndent } from 'common-tags';
import { box } from '@thebespokepixel/string';
import { readPackageSync } from 'read-pkg';
import _ from 'lodash';
import { simple, palette } from 'trucolor';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import terminalFeatures from 'term-ng';
import columnify from 'columnify';
import { osLocaleSync } from 'os-locale';
import { createConsole } from 'verbosity';
import meta from '@thebespokepixel/meta';
import { createSelector } from '@thebespokepixel/n-selector';
import ansiRegex from 'ansi-regex';
import { statSync, readFileSync } from 'node:fs';

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

const tabRegex$1 = /\t/g;
const newlineRegex$1	= /\n/g;
class Tokeniser {
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
	process(source) {
		return source
			.replace(newlineRegex$1, '\u0000>/\\//__<\u0000')
			.replace(tabRegex$1, '\u0000>T/\\B<\u0000')
			.replace(ansiRegex(), '\u0000$&\u0000')
			.replace(this.tokenisingRegex, '\u0000$&\u0000')
			.split('\u0000')
			.filter(token => token !== '')
	}
	restore(source) {
		return source
			.replace(/>\/\\\/\/__</g, '\n')
			.trimEnd()
	}
}
function createTokeniser(tokenisingRegex) {
	return new Tokeniser(tokenisingRegex)
}

const newlineRegex = /^>\/\\\/\/__<$/;
const tabRegex = /^>T\/\\B<$/;
class LineFitter {
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
	createTab() {
		const width = this.tabWidth - (this.cursor % this.tabWidth) || 4;
		this.cursor += width;
		console.debug('[TAB', width, ']', '▸', this.cursor);
		return ' '.repeat(width)
	}
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
	toString() {
		return this.lineTokens.join('')
	}
}
function createLineFitter(margin, width, tabWidth) {
	return new LineFitter([margin, width, tabWidth])
}

class WrapTool {
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
function createWrapTool(options) {
	return new WrapTool(options)
}

const prefix = '\u001B]1337;File=inline=1;';
const suffix = '\u0007';
const broken = join(dirname(fileURLToPath(import.meta.url)), '/media/broken.png');
class Image {
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
function createImage(source) {
	return new Image(source)
}

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
function unimplemented() {
	throw new Error('Unimplemented.')
}
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
	const api = {
		end() {
			if (outStream._isStdio) {
				outStream.write('\n');
			} else {
				outStream.end();
			}
		},
		getWidth: unimplemented,
		panel(content, configuration) {
			if (outStream._isStdio) {
				outStream.write(columnify(content, configuration));
			}
			return this
		},
		break(newlines = 1) {
			outStream.write('\n'.repeat(newlines));
			return this
		},
		clear() {
			outStream.write('\n');
			return this
		},
		write(text) {
			outStream.write(text);
			return this
		}
	};
	switch (true) {
		case !ttyActive:
			console.info(colorReplacer`${'yellow|Non-TTY'}: width: Infinity`);
			return Object.assign(Object.create(api), {
				getWidth: () => ttyWidth
			})
		case renderMode.selected === 'container':
			console.info(`Container: width: ${width}, render mode: ${renderMode.selected}`);
			return Object.assign(Object.create(api), {
				getWidth: () => ttyWidth
			})
		default:
			console.info(stripIndent(colorReplacer)`
				${'green|Renderer'}:
				  mode ▸ ${renderMode.selected} [${locale}]
				  ┆ ${left} ◂├╌╌╌╌ ${viewWidth} ╌╌╌╌┤▸ ${right} ┆
			`, '\n');
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

const images = (function () {
	if (terminalFeatures.images) {
		return {
			space: '\t ',
			cc: createImage({
				name: 'logo',
				file: join(dirname(fileURLToPath(import.meta.url)), '/media/bytetree.png'),
				height: 3,
			}),
		}
	}
	return {
		space: '',
		cc: {
			render: () => '',
		},
	}
})();
async function help(yargsInstance) {
	const header = () => stripIndent(colorReplacer)`
		${`title| ${metadata.name}`}
		${images.space}${metadata.description}
		${images.space}${`grey|${metadata.version(3)}`}
	`;
	const synopsis = stripIndent(colorReplacer)`
		${'title|Synopsis:'}
		${'command|cat'} ${'argument|inputFile'} ${'operator:|'} ${`command|${metadata.bin}`} ${'option|[options]'}
	`;
	const usage = stripIndent(colorReplacer)`
		${'title|Usage:'}
		Reads unformatted text from stdin and typographically applies paragraph wrapping it for the currently active tty.
	`;
	const epilogue = stripIndent(colorReplacer)`
		${`title|${metadata.name}`} ${`white|${metadata.copyright}`}. ${`grey|Released under the ${metadata.license} License.`}
		${`grey|An Open Source component from ByteTree.com's terminal visualisation toolkit.`}
		${`grey|Issues?: ${metadata.bugs}`}
	`;
	const container = truwrap({
		mode: 'container',
		outStream: process.stderr,
	});
	const windowWidth = container.getWidth();
	const renderer = truwrap({
		left: 2,
		right: 0,
		outStream: process.stderr,
	});
	const usageContent = yargsInstance.wrap(renderer.getWidth()).getHelp();
	container.break();
	container.write(images.cc.render({
		nobreak: false,
		align: 2,
	}));
	container.write(header()).break();
	container.write(`${clr.dark}${'—'.repeat(windowWidth)}${clr.dark.out}`).break();
	renderer.write(synopsis).break(2);
	renderer.write(await usageContent).break(2);
	renderer.write(usage).break(2);
	container.write(`${clr.dark}${'—'.repeat(windowWidth)}${clr.dark.out}`);
	renderer.write(epilogue).end();
}

const pkg = readPackageSync();
const yargsInstance = yargs(hideBin(process.argv))
	.strictOptions()
	.help(false)
	.version(false)
	.options({
		h: {
			alias: 'help',
			describe: 'Display this help.'
		},
		v: {
			alias: 'version',
			count: true,
			describe: 'Return the current version on stdout. -vv Return name & version.'
		},
		V: {
			alias: 'verbose',
			count: true,
			describe: 'Be verbose. -VV Be loquacious.'
		},
		o: {
			alias: 'stderr',
			boolean: true,
			describe: 'Use stderr rather than stdout',
			default: false
		},
		l: {
			alias: 'left',
			describe: 'Left margin',
			requiresArg: true,
			default: 2
		},
		r: {
			alias: 'right',
			describe: 'Right margin',
			requiresArg: true,
			default: 2
		},
		w: {
			alias: 'width',
			describe: 'Set total width. Overrides terminal window’s width.',
			requiresArg: true,
			nargs: 1
		},
		t: {
			alias: 'tab',
			describe: 'Set tab width.',
			requiresArg: true,
			default: 2
		},
		m: {
			alias: 'mode',
			choices: ['hard', 'soft', 'keep', 'container'],
			describe: 'Wrapping mode',
			default: 'soft',
			requiresArg: true
		},
		s: {
			alias: 'stamp',
			boolean: true,
			describe: 'Print arguments rather than stdin. printf-style options supported.'
		},
		p: {
			alias: 'panel',
			boolean: true,
			describe: 'Render a tabular panel into the available console width.'
		},
		c: {
			alias: 'truncate',
			boolean: true,
			describe: 'Truncate panel cells.'
		},
		d: {
			alias: 'delimiter',
			describe: 'The column delimiter when reading data for a panel.',
			requiresArg: true,
			default: '|'
		},
		x: {
			alias: 'regex',
			describe: 'Character run selection regex.',
			requiresArg: true
		},
		color: {
			describe: 'Force color depth --color=256|16m. Disable with --no-color'
		}
	}).showHelpOnFail(false, `Use 'truwrap --help' for help.`);
const {argv} = yargsInstance;
const outStream = argv.stderr ? process.stderr : process.stdout;
if (argv.version) {
	process.stdout.write(`${metadata.version(argv.version)}\n`);
	process.exit(0);
}
if (argv.verbose) {
	const settings = {
		borderColor: 'green',
		margin: {
			bottom: 1,
			top: 1
		},
		padding: {
			bottom: 0,
			top: 0,
			left: 2,
			right: 2
		}
	};
	const titling = mode => stripIndent(colorReplacer)`
		${`title|${metadata.name}`}${`dim| │ v${metadata.version()}`}
		Mode: ${mode}
	`;
	switch (argv.verbose) {
		case 1:
			console.verbosity(4);
			console.log(box(titling('Verbose'), settings));
			break
		case 2:
			console.verbosity(5);
			console.log(box(titling('Some might say loquacious'), settings));
			console.yargs(argv);
			console.debug('');
			break
		default:
			console.verbosity(3);
	}
}
if (!(process.env.USER === 'root' && process.env.SUDO_USER !== process.env.USER)) {
	updateNotifier({pkg}).notify();
}
if (argv.help) {
	(async () => {
		await help(yargsInstance);
		process.exit(0);
	})();
}
const viewSettings = {
	left: argv.left,
	right: argv.right,
	mode: argv.mode,
	tabWidth: argv.tab,
	outStream
};
if (argv.regex) {
	viewSettings.tokenRegex = new RegExp(argv.regex, 'g');
}
if (argv.width) {
	viewSettings.width = argv.width;
}
const renderer = truwrap(viewSettings);
if (argv.stamp) {
	renderer.write(format(...argv._));
	process.exit(0);
}
getStdin().then(input => {
	if (argv.panel) {
		const panel$1 = panel(input, argv.delimiter, renderer.getWidth());
		renderer.panel(panel$1.content, {
			maxLineWidth: renderer.getWidth(),
			showHeaders: false,
			truncate: argv.truncate,
			config: panel$1.configuration
		});
	} else {
		renderer.write(input);
	}
});
