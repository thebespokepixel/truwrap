import stream from 'node:stream'
import test from 'ava'
import semverRegex from 'semver-regex'
import {readPackageSync} from 'read-pkg'
import {truwrap, metadata} from '../index.js'

const pkg = readPackageSync()

const StreamProxy = new stream.PassThrough()
StreamProxy.setEncoding('utf8')

const expectedVersion = pkg.version

test(`Module version is '${expectedVersion}'.`, t => {
	t.is(`${expectedVersion}`, metadata.version())
})

test(`Module version '${pkg.version}' is semver.`, t => {
	t.truthy(semverRegex().test(metadata.version()))
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
