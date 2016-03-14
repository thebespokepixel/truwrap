'use strict'
import pkg from '../package.json'
import stream from 'stream'
import test from 'ava'
import truwrap from '..'
import semverRegex from 'semver-regex'

const StreamProxy = new stream.PassThrough()
StreamProxy.setEncoding('utf8')

test(`Module version is '${pkg.version}'.`, t => {
	t.is(`${pkg.version}`, truwrap.getVersion())
})

test(`Module version '${pkg.version} is semver'.`, t => {
	t.ok(semverRegex().test(truwrap.getVersion()))
})

test(`Returns renderer.`, t => {
	const tw = truwrap({
		left: 4,
		right: -4
	})
	if (tw.write && tw.end) {
		t.pass('Is renderer')
	}
})

test.cb(`Consumes stream.`, t => {
	const tw = truwrap({
		left: 4,
		right: -4,
		mode: 'soft',
		outStream: StreamProxy
	})

	StreamProxy.on('data', buffer_ => {
		t.is(buffer_, 'Testing.')
		t.end()
	})
	tw.write('Testing.')
})
