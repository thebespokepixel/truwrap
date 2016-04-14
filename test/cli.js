'use strict'
import shell from 'shelljs'
import pkg from '../package.json'
import test from 'ava'

const expectedVersion = pkg.build_number === 0 && pkg.version || `${pkg.version}-Δ${pkg.build_number}`

test.cb(`Module name/version is '${pkg.name}'.`, t => {
	shell.exec('/usr/bin/env node ../lib/cli/index.js -vv', {
		silent: true
	}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, `${pkg.name} v${expectedVersion}`)
		t.end()
	})
})

test.cb('Soft wrap to width = 40, left = 0, right = 0', t => {
	const fixture = shell.cat('fixtures/out/lorem-40-0-0.txt')
	shell.exec('cat ./fixtures/in/lorem.txt | /usr/bin/env node ../lib/cli/index.js --left 0 --right 0 --width 40', {
		silent: true
	}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, fixture)
		t.end()
	})
})

test.cb('Soft wrap tabbed source to width = 40, left = 0, right = 0', t => {
	const fixture = shell.cat('fixtures/out/tabbed-40-0-0.txt')
	shell.exec('cat ./fixtures/in/tabbed.txt | /usr/bin/env node ../lib/cli/index.js --left 0 --right 0 --width 40', {
		silent: true
	}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, fixture)
		t.end()
	})
})

test.cb('Soft wrap to width = 40, left = 6, right = 4', t => {
	const fixture = shell.cat('fixtures/out/lorem-40-6-4.txt')
	shell.exec('cat ./fixtures/in/lorem.txt | /usr/bin/env node ../lib/cli/index.js --left 6 --right 4 --width 40', {
		silent: true
	}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, fixture)
		t.end()
	})
})

test.cb('Hard wrap to width = 40, left = 8, right = 8', t => {
	const fixture = shell.cat('fixtures/out/lorem-40-8-8.txt')
	shell.exec('cat ./fixtures/in/lorem.txt | /usr/bin/env node ../lib/cli/index.js --left 8 --right 8 --width 40 --mode hard', {
		silent: true
	}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, fixture)
		t.end()
	})
})

test.cb('Hard wrap to width = 20', t => {
	const fixture = shell.cat('fixtures/out/lorem-20.txt')
	shell.exec('cat ./fixtures/in/lorem.txt | /usr/bin/env node ../lib/cli/index.js --width 20 --mode hard', {
		silent: true
	}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, fixture)
		t.end()
	})
})

test.cb('Hard wrap tabbed source to width = 30', t => {
	const fixture = shell.cat('fixtures/out/tabbed-30.txt')
	shell.exec('cat ./fixtures/in/tabbed.txt | /usr/bin/env node ../lib/cli/index.js --width 30 --mode hard', {
		silent: true
	}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, fixture)
		t.end()
	})
})

test.cb('Keep wrap to width = 20, left = 10, right = 0', t => {
	const fixture = shell.cat('fixtures/out/ls-20-10-0.txt')
	shell.exec('cat ./fixtures/in/ls.txt | /usr/bin/env node ../lib/cli/index.js --left 10 --right 0 --width 20 --mode keep', {
		silent: true
	}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, fixture)
		t.end()
	})
})

test.cb('Keep wrap to width = 40, left = 0, right = 0', t => {
	const fixture = shell.cat('fixtures/out/ls-40-0-0.txt')
	shell.exec('cat ./fixtures/in/ls.txt | /usr/bin/env node ../lib/cli/index.js --left 0 --right 0 --width 40 --mode keep', {
		silent: true
	}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, fixture)
		t.end()
	})
})

test.cb('Keep wrap to width = 80, left = 1, right = 0', t => {
	const fixture = shell.cat('fixtures/out/ls-80-1-0.txt')
	shell.exec('cat ./fixtures/in/ls.txt | /usr/bin/env node ../lib/cli/index.js --left 1 --right 0 --width 80 --mode keep', {
		silent: true
	}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, fixture)
		t.end()
	})
})

test.cb('Stamp: "Hello %s!" World --width 40', t => {
	const fixture = shell.cat('fixtures/out/stamp.txt')
	shell.exec('cat ./fixtures/in/lorem.txt | /usr/bin/env node ../lib/cli/index.js -s "Hello %s!" World --width 40', {
		silent: true
	}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, fixture)
		t.end()
	})
})

test.cb('Panel: width = 70, left = 10', t => {
	const fixture = shell.cat('fixtures/out/panel.txt')
	shell.exec('cat ./fixtures/in/panel.txt | /usr/bin/env node ../lib/cli/index.js --panel --width 70 --left 10', {
		silent: true
	}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, fixture)
		t.end()
	})
})
