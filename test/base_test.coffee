'use strict'

vows = require ('vows')
assert = require ('assert')
wrap = require ('../../truwrap')

vows
	.describe('truwrap utilities')
	.addBatch
		'Get version as a':
			'short number?':
				topic: wrap.getVersion 1
				'Should result in a short version number x.x.x-x': (topic) ->
					assert.match topic, /[0-9]+.[0-9]+.[0-9]+[0-9a-z.-]*/

			'long string?':
				topic: wrap.getVersion 2
				'Should result in a long version number truwrap vx.x.x-x': (topic) ->
					assert.match topic, /truwrap v[0-9]+.[0-9]+.[0-9]+[0-9a-z.-]*/
.export(module)
