import {basename} from 'node:path'
import {fileURLToPath} from 'node:url'
import {readFileSync} from 'node:fs'
import {PassThrough} from 'node:stream'
import test from 'ava'
import {truwrap} from '../index.js'

const width = basename(fileURLToPath(import.meta.url), '.js').split('-')[1] // 10, 20, 40, 60, 80, 100

const lorem = readFileSync('test/fixtures/in/lorem.txt').toString()

for (const right of [0, 1, 5]) {
	for (const left of [0, 1, 2, 5, 10]) {
		const StreamProxy = new PassThrough()
		StreamProxy.setEncoding('utf8')

		test(`Stream: Hard wrap to w${width} l${left} r${right}`, async t => {
			const renderer = truwrap({
				left,
				right,
				width,
				mode: 'hard',
				outStream: StreamProxy,
			})

			const buffered = await new Promise(resolve => {
				StreamProxy.on('data', buffer_ => {
					resolve(buffer_)
				})
				renderer.write(lorem)
			})

			t.snapshot(buffered)
		})
	}
}
