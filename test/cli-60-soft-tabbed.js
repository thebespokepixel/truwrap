import {basename} from 'node:path'
import {fileURLToPath} from 'node:url'
import {promisify} from 'node:util'
import {exec} from 'node:child_process'
import test from 'ava'

const execPromise = promisify(exec)

const width = basename(fileURLToPath(import.meta.url), '.js').split('-')[1] // 10, 20, 40, 60, 80, 100

for (const right of [0, 1, 5]) {
	for (const left of [0, 1, 2, 5, 10]) {
		test(`Soft wrap tabbed source to w${width} l${left} r${right}`, async t => {
			const {stdout} = await execPromise(
				`cat ./test/fixtures/in/tabbed.txt | ./truwrap.js --left ${left} --right ${right} --width ${width}`,
			)
			t.snapshot(stdout)
		})
	}
}
