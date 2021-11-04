import {basename} from 'node:path'
import {fileURLToPath} from 'node:url'
import {readFileSync} from 'node:fs'
import test from 'ava'
import {truwrap} from '../index.js'

const width = basename(fileURLToPath(import.meta.url), '.js').split('-')[1] // 10, 20, 40, 60, 80, 100

const ls = readFileSync('test/fixtures/in/ls.txt').toString()

for (const right of [0, 1, 5]) {
	for (const left of [0, 1, 2, 5, 10]) {
		test(`Direct: Keep wrap to w${width} l${left} r${right}`, t => {
			const renderer = truwrap({
				left,
				right,
				width,
				mode: 'keep',
			})
			renderer.write(ls)
			t.snapshot(renderer.end())
		})
	}
}
