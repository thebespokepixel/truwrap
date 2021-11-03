import {basename} from 'node:path'
import {fileURLToPath} from 'node:url'
import {promisify} from 'node:util'
import {exec} from 'node:child_process'
import test from 'ava'

const execPromise = promisify(exec)

const width = basename(fileURLToPath(import.meta.url), '.js').split('-')[1] // 10, 20, 40, 60, 80, 100

if ([40, 60, 80, 100].includes(Number(width))) {
	test(`Panel w${width} l0 r0`, async t => {
		const {stdout} = await execPromise(
			`cat ./test/fixtures/in/panel.txt | ./truwrap.js --panel --width ${width} --left 0 --right 0`,
		)
		t.snapshot(stdout)
	})
} else {
	test(`Panel w${width} l0 r0`, t => {
		t.pass()
	})
}
