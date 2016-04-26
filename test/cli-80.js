'use strict'
import path from 'path'
import shell from 'shelljs'
import test from 'ava'
import pkg from '../package.json'

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

const width = path.basename(__filename, '.js').split('-')[1] // 10, 20, 40, 60, 80, 100

if ([40, 60, 80, 100].indexOf(Number(width)) !== -1) {
	test.cb(`Panel: width = ${width} left = 0, right = 0`, t => {
		const fixture = shell.cat(`fixtures/out/panel-${width}-0-0.txt`).toString()
		shell.exec(`cat ./fixtures/in/panel.txt | /usr/bin/env node ../lib/cli/index.js --panel --width ${width} --left 0 --right 0`, {
			silent: true
		}, (code_, out_) => {
			t.is(code_, 0)
			t.is(out_, fixture)
			t.end()
		})
	})
}

[0, 1, 5].forEach(right => {
	[0, 1, 2, 5, 10].forEach(left => {
		test.serial.cb(`Soft wrap to width = ${width}, left = ${left}, right = ${right}`, t => {
			const fixture = shell.cat(`fixtures/out/lorem-soft-${width}-${left}-${right}.txt`).toString()
			shell.exec(`cat ./fixtures/in/lorem.txt | /usr/bin/env node ../lib/cli/index.js --left ${left} --right ${right} --width ${width}`, {
				silent: true
			}, (code_, out_) => {
				t.is(code_, 0)
				t.is(out_, fixture)
				t.end()
			})
		})

		test.serial.cb(`Soft wrap tabbed source to width = ${width}, left = ${left}, right = ${right}`, t => {
			const fixture = shell.cat(`fixtures/out/tabbed-soft-${width}-${left}-${right}.txt`).toString()
			shell.exec(`cat ./fixtures/in/tabbed.txt | /usr/bin/env node ../lib/cli/index.js --left ${left} --right ${right} --width ${width}`, {
				silent: true
			}, (code_, out_) => {
				t.is(code_, 0)
				t.is(out_, fixture)
				t.end()
			})
		})

		test.serial.cb(`Hard wrap to width = ${width}, left = ${left}, right = ${right}`, t => {
			const fixture = shell.cat(`fixtures/out/lorem-hard-${width}-${left}-${right}.txt`).toString()
			shell.exec(`cat ./fixtures/in/lorem.txt | /usr/bin/env node ../lib/cli/index.js --left ${left} --right ${right} --width ${width} --mode hard`, {
				silent: true
			}, (code_, out_) => {
				t.is(code_, 0)
				t.is(out_, fixture)
				t.end()
			})
		})

		test.serial.cb(`Hard wrap tabbed source to width = ${width}, left = ${left}, right = ${right}`, t => {
			const fixture = shell.cat(`fixtures/out/tabbed-hard-${width}-${left}-${right}.txt`).toString()
			shell.exec(`cat ./fixtures/in/tabbed.txt | /usr/bin/env node ../lib/cli/index.js --left ${left} --right ${right} --width ${width} --mode hard`, {
				silent: true
			}, (code_, out_) => {
				t.is(code_, 0)
				t.is(out_, fixture)
				t.end()
			})
		})

		test.serial.cb(`Keep wrap to width = ${width}, left = ${left}, right = ${right}`, t => {
			const fixture = shell.cat(`fixtures/out/ls-keep-${width}-${left}-${right}.txt`).toString()
			shell.exec(`cat ./fixtures/in/ls.txt | /usr/bin/env node ../lib/cli/index.js --left ${left} --right ${right} --width ${width} --mode keep`, {
				silent: true
			}, (code_, out_) => {
				t.is(code_, 0)
				t.is(out_, fixture)
				t.end()
			})
		})

		test.serial.cb(`Stamp: "Hello %s!" World width = ${width}, left = ${left}, right = ${right}`, t => {
			const fixture = shell.cat(`fixtures/out/stamp-${width}-${left}-${right}.txt`).toString()
			shell.exec(`cat ./fixtures/in/lorem.txt | /usr/bin/env node ../lib/cli/index.js -s "Hello %s!" World --left ${left} --right ${right} --width ${width}`, {
				silent: true
			}, (code_, out_) => {
				t.is(code_, 0)
				t.is(out_, fixture)
				t.end()
			})
		})
	})
})

