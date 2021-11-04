/* ────────────╮
 │ truwrap CLI │
 ╰─────────────┴──────────────────────────────────────────────────────────────── */
/* eslint node/prefer-global/process: [error] */

/** @module module:truwrap/cli/help */
import {join, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import terminalFeatures from 'term-ng'
import {stripIndent} from 'common-tags'

import {clr, colorReplacer} from '../lib/colour.js'
import {truwrap, metadata, createImage} from '..'

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
})()

/**
 * Render help when asked for.
 * @param  {yargs} yargsInstance - yargs object defined in cli
 * @return {null} Writes help to stdout.
 */
export default async function help(yargsInstance) {
	const header = () => stripIndent(colorReplacer)`
		${`title|${metadata.name}`}
		${images.space}${metadata.description}
		${images.space}${`grey|${metadata.version(3)}`}
	`
	const synopsis = stripIndent(colorReplacer)`
		${'title|Synopsis:'}
		${'command|cat'} ${'argument|inputFile'} ${'operator:|'} ${`command|${metadata.bin}`} ${'option|[options]'}
	`
	const usage = stripIndent(colorReplacer)`
		${'title|Usage:'}
		Reads unformatted text from stdin and typographically applies paragraph wrapping it for the currently active tty.
	`
	const epilogue = stripIndent(colorReplacer)`
		${`title|${metadata.name}`} ${`white|${metadata.copyright}`}. ${`grey|Released under the ${metadata.license} License.`}
		${'grey|An Open Source component from ByteTree.com\'s terminal visualisation toolkit'}
		${`grey|Issues?: ${metadata.bugs}`}
	`

	const container = truwrap({
		mode: 'container',
		outStream: process.stderr,
	})
	const windowWidth = container.getWidth()

	const renderer = truwrap({
		left: 2,
		right: 0,
		outStream: process.stderr,
	})

	const usageContent = yargsInstance.wrap(renderer.getWidth()).getHelp()

	container.break()
	container.write(images.cc.render({
		nobreak: false,
		align: 2,
		spacing: ' ',
	}))
	container.write(header()).break()
	container.write(`${clr.dark}${'—'.repeat(windowWidth)}${clr.dark.out}`).break()
	renderer.write(synopsis).break(2)
	renderer.write(await usageContent).break(2)
	renderer.write(usage).break(2)
	container.write(`${clr.dark}${'—'.repeat(windowWidth)}${clr.dark.out}`)
	renderer.write(epilogue).end()
}
