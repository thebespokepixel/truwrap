import {PassThrough} from 'node:stream'
import test from 'ava'
import semverRegex from 'semver-regex'
import {readPackageSync} from 'read-pkg'
import {truwrap} from '../index.js'

const pkg = readPackageSync()

const StreamProxy = new PassThrough()
StreamProxy.setEncoding('utf8')

test(`Module version '${pkg.version}' is semver.`, t => {
	t.truthy(semverRegex().test(pkg.version))
})

test('Returns renderer.', t => {
	const tw = truwrap({
		left: 4,
		right: 4,
	})
	t.truthy(tw.write && tw.end)
})

test('Consumes stream.', async t => {
	const tw = truwrap({
		left: 4,
		width: 24,
		mode: 'soft',
		outStream: StreamProxy,
	})

	const buffered = await new Promise(resolve => {
		StreamProxy.on('data', buffer_ => {
			resolve(buffer_)
		})
		tw.write('Testing.')
	})

	t.is(buffered, '    Testing.')
})

test('Testing breaks', t => {
	const tw = truwrap({
		left: 4,
		right: 4,
		mode: 'soft',
	})

	tw.write('One').break()
	tw.write('Two').break(2)
	tw.write('Three').break(3)
	tw.write('Clear').clear()

	t.snapshot(tw.end())
})
