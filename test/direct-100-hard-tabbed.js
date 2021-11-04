import {basename} from 'node:path'
import {fileURLToPath} from 'node:url'
import {readFileSync} from 'node:fs'
import {promisify} from 'node:util'
import {exec} from 'node:child_process'
import test from 'ava'
import {truwrap} from '../index.js'

const execPromise = promisify(exec)

const width = basename(fileURLToPath(import.meta.url), '.js').split('-')[1] // 10, 20, 40, 60, 80, 100

const tabbed = readFileSync('test/fixtures/in/tabbed.txt').toString()

for (const right of [0, 1, 5]) {
	for (const left of [0, 1, 2, 5, 10]) {
		test(`Direct: Hard wrap tabbed source to w${width} l${left} r${right}`, async t => {
			const renderer = truwrap({
				left,
				right,
				width,
				mode: 'hard'
			})
			renderer.write(tabbed)
			t.snapshot(renderer.end())
		})
	}
}
