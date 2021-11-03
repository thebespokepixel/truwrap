import {promisify} from 'node:util'
import {exec} from 'node:child_process'
import test from 'ava'
import {readPackageSync} from 'read-pkg'

const pkg = readPackageSync()
const expectedVersion = pkg.version
const execPromise = promisify(exec)

test(`Module name/version is '${pkg.name} v${expectedVersion}'.`, async t => {
	const {stdout} = await execPromise('./truwrap.js -vv')
	t.is(stdout.trim(), `${pkg.name} v${expectedVersion}`)
})

test('Module help, no color', async t => {
	const {stderr} = await execPromise('./truwrap.js --help --no-color')
	t.snapshot(stderr)
})
