/* ────────────╮
 │ truwrap CLI │
 ╰─────────────┴─────────────────────────────────────────────────────────────── */

import {format} from 'util'

import yargs from 'yargs'
import {hideBin} from 'yargs/helpers' // eslint-disable-line node/file-extension-in-import
import getStdin from 'get-stdin'
import updateNotifier from 'update-notifier'
import {stripIndent} from 'common-tags'
import {box} from '@thebespokepixel/string'
import {readPackageSync} from 'read-pkg'
import {colorReplacer} from '../lib/colour'
import help from './help.js'
import {truwrap, console, metadata, parsePanel} from '../index.js'

const pkg = readPackageSync()

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
	}).showHelpOnFail(false, `Use 'truwrap --help' for help.`)

const {argv} = yargsInstance

const outStream = argv.stderr ? process.stderr : process.stdout

if (argv.version) {
	process.stdout.write(`${metadata.version(argv.version)}\n`)
	process.exit(0)
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
	}

	const titling = mode => stripIndent(colorReplacer)`
		${`title|${metadata.name}`}${`dim| │ v${metadata.version()}`}
		Mode: ${mode}
	`
	switch (argv.verbose) {
		case 1:
			console.verbosity(4)
			console.log(box(titling('Verbose'), settings))
			break
		case 2:
			console.verbosity(5)
			console.log(box(titling('Some might say loquacious'), settings))
			console.yargs(argv)
			console.debug('')
			break
		default:
			console.verbosity(3)
	}
}

if (!(process.env.USER === 'root' && process.env.SUDO_USER !== process.env.USER)) {
	updateNotifier({pkg}).notify()
}

if (argv.help) {
	(async () => {
		await help(yargsInstance)
	})()
} else {
	const viewSettings = {
		left: argv.left,
		right: argv.right,
		mode: argv.mode,
		tabWidth: argv.tab,
		outStream
	}

	if (argv.regex) {
		viewSettings.tokenRegex = new RegExp(argv.regex, 'g')
	}

	if (argv.width) {
		viewSettings.width = argv.width
	}

	const renderer = truwrap(viewSettings)

	if (argv.stamp) {
		renderer.write(format(...argv._))
	} else {
		getStdin().then(input => {
			if (argv.panel) {
				const panel = parsePanel(input, argv.delimiter, renderer.getWidth())
				renderer.panel(panel.content, {
					maxLineWidth: renderer.getWidth(),
					showHeaders: false,
					truncate: argv.truncate,
					config: panel.configuration
				})
			} else {
				renderer.write(input)
			}
		})
	}
}
