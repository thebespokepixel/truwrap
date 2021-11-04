import {basename} from 'node:path'
import {fileURLToPath} from 'node:url'
import {readFileSync} from 'node:fs'
import test from 'ava'
import {truwrap, parsePanel} from '../index.js'

const width = basename(fileURLToPath(import.meta.url), '.js').split('-')[1] // 10, 20, 40, 60, 80, 100

const panel = readFileSync('test/fixtures/in/panel.txt').toString()

if ([40, 60, 80, 100].includes(Number(width))) {
	test(`Direct: Panel w${width} l0 r0`, t => {
		const renderer = truwrap({
			left: 0,
			right: 0,
			width,
			mode: 'soft',
		})
		const panelSource = parsePanel(panel, '|', renderer.getWidth())
		const panelOptions = {
			maxLineWidth: renderer.getWidth(),
			showHeaders: false,
			truncate: false,
			config: panelSource.configuration,
		}
		renderer.panel(panelSource.content, panelOptions)
		t.snapshot(renderer.end())
	})
} else {
	test(`Panel w${width} l0 r0`, t => {
		t.pass()
	})
}
