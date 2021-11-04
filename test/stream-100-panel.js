import {basename} from 'node:path'
import {fileURLToPath} from 'node:url'
import {readFileSync} from 'node:fs'
import {PassThrough} from 'node:stream'
import test from 'ava'
import {truwrap, parsePanel} from '../index.js'

const width = basename(fileURLToPath(import.meta.url), '.js').split('-')[1] // 10, 20, 40, 60, 80, 100

const panel = readFileSync('test/fixtures/in/panel.txt').toString()

if ([40, 60, 80, 100].includes(Number(width))) {
	const StreamProxy = new PassThrough()
	StreamProxy.setEncoding('utf8')

	test(`Stream: Panel w${width} l0 r0`, async t => {
		const renderer = truwrap({
			left: 0,
			right: 0,
			width,
			mode: 'soft',
			outStream: StreamProxy,
		})

		const panelSource = parsePanel(panel, '|', renderer.getWidth())

		const panelOptions = {
			maxLineWidth: renderer.getWidth(),
			showHeaders: false,
			truncate: false,
			config: panelSource.configuration,
		}

		const buffered = await new Promise(resolve => {
			StreamProxy.on('data', buffer_ => {
				resolve(buffer_)
			})
			renderer.panel(panelSource.content, panelOptions)
		})

		t.snapshot(buffered)
	})
} else {
	test(`Panel w${width} l0 r0`, t => {
		t.pass()
	})
}
