'use strict';
var vows = require('vows'),
	assert = require('assert'),
	wrap = require('../../truwrap')

vows.describe('truwrap utilities').addBatch({
	'Get version': {
		'Short version number?': {
			topic: wrap.getVersion(),
			'Should result in a short version number x.x.x-x': function (topic) {
				assert.match(topic, /[0-9]+.[0-9]+.[0-9]+[0-9-]*/)
			}
		},
		'Long version message?': {
			topic: wrap.getVersion(true),
			'Should result in a version message: truwrap vx.x.x-x': function (topic) {
				assert.match(topic, /^truwrap v[0-9]+.[0-9]+.[0-9]+[0-9-]*/)
			}
		},
	}
}).export(module);
