'use strict';
var vows = require('vows'),
	assert = require('assert'),
	consoleWrap = require('../../console-wrap')

vows.describe('consoleWrap utilities').addBatch({
	'Get version': {
		'Short version number?': {
			topic: consoleWrap.getVersion(),
			'Should result in a short version number x.x.x-x': function (topic) {
				assert.match(topic, /[0-9]+.[0-9]+.[0-9]+[0-9-]*/)
			}
		},
		'Long version message?': {
			topic: consoleWrap.getVersion(true),
			'Should result in a version message: console-wrap vx.x.x-x': function (topic) {
				assert.match(topic, /^console-wrap v[0-9]+.[0-9]+.[0-9]+[0-9-]*/)
			}
		},
	}
}).export(module);
