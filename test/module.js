import stream from 'stream'
import test from 'ava'
import semverRegex from 'semver-regex'
import pkg from '../package'
import {truwrap, metadata} from '..'

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
		right: 4
	})
	t.truthy(tw.write && tw.end)
})

test.cb('Consumes stream.', t => {
	const tw = truwrap({
		left: 4,
		width: 24,
		mode: 'soft',
		outStream: StreamProxy
	})

	StreamProxy.on('data', buffer_ => {
		t.is(buffer_, '    Testing.')
		t.end()
	})
	tw.write('Testing.')
})
