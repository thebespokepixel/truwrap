import path from 'path'
import {readFileSync} from 'fs'
import {exec} from 'child_process'
import test from 'ava'
import pkg from '../package'

const expectedVersion = pkg.version

test.cb(`Module name/version is '${pkg.name} v${expectedVersion}'.`, t => {
	exec('./bin/truwrap -vv', (error_, out_) => {
		t.is(error_, null)
		t.is(out_.trim(), `${pkg.name} v${expectedVersion}`)
		t.end()
	})
})

const width = path.basename(__filename, '.js').split('-')[1] // 10, 20, 40, 60, 80, 100

if ([40, 60, 80, 100].indexOf(Number(width)) !== -1) {
	test.cb(`Panel: width = ${width} left = 0, right = 0`, t => {
		const fixture = readFileSync(`./test/fixtures/out/panel-${width}-0-0.txt`, 'utf8')
		exec(
			`cat ./test/fixtures/in/panel.txt | ./bin/truwrap --panel --width ${width} --left 0 --right 0`,
			(error_, out_) => {
				t.is(error_, null)
				t.is(out_, fixture)
				t.end()
			}
		)
	})
}

[0, 1, 5].forEach(right => {
	[0, 1, 2, 5, 10].forEach(left => {
		test.serial.cb(`Soft wrap to width = ${width}, left = ${left}, right = ${right}`, t => {
			const fixture = readFileSync(`./test/fixtures/out/lorem-soft-${width}-${left}-${right}.txt`, 'utf8')
			exec(
				`cat ./test/fixtures/in/lorem.txt | ./bin/truwrap --left ${left} --right ${right} --width ${width}`,
				(error_, out_) => {
					t.is(error_, null)
					t.is(out_, fixture)
					t.end()
				}
			)
		})

		test.serial.cb(`Soft wrap tabbed source to width = ${width}, left = ${left}, right = ${right}`, t => {
			const fixture = readFileSync(`./test/fixtures/out/tabbed-soft-${width}-${left}-${right}.txt`, 'utf8')
			exec(
				`cat ./test/fixtures/in/tabbed.txt | ./bin/truwrap --left ${left} --right ${right} --width ${width}`,
				(error_, out_) => {
					t.is(error_, null)
					t.is(out_, fixture)
					t.end()
				}
			)
		})

		test.serial.cb(`Hard wrap to width = ${width}, left = ${left}, right = ${right}`, t => {
			const fixture = readFileSync(`./test/fixtures/out/lorem-hard-${width}-${left}-${right}.txt`, 'utf8')
			exec(
				`cat ./test/fixtures/in/lorem.txt | ./bin/truwrap --left ${left} --right ${right} --width ${width} --mode hard`,
				(error_, out_) => {
					t.is(error_, null)
					t.is(out_, fixture)
					t.end()
				}
			)
		})

		test.serial.cb(`Hard wrap tabbed source to width = ${width}, left = ${left}, right = ${right}`, t => {
			const fixture = readFileSync(`./test/fixtures/out/tabbed-hard-${width}-${left}-${right}.txt`, 'utf8')
			exec(
				`cat ./test/fixtures/in/tabbed.txt | ./bin/truwrap --left ${left} --right ${right} --width ${width} --mode hard`,
				(error_, out_) => {
					t.is(error_, null)
					t.is(out_, fixture)
					t.end()
				}
			)
		})

		test.serial.cb(`Keep wrap to width = ${width}, left = ${left}, right = ${right}`, t => {
			const fixture = readFileSync(`./test/fixtures/out/ls-keep-${width}-${left}-${right}.txt`, 'utf8')
			exec(
				`cat ./test/fixtures/in/ls.txt | ./bin/truwrap --left ${left} --right ${right} --width ${width} --mode keep`,
				(error_, out_) => {
					t.is(error_, null)
					t.is(out_, fixture)
					t.end()
				}
			)
		})

		test.serial.cb(`Stamp: "Hello %s!" World width = ${width}, left = ${left}, right = ${right}`, t => {
			const fixture = readFileSync(`./test/fixtures/out/stamp-${width}-${left}-${right}.txt`, 'utf8')
			exec(
				`cat ./test/fixtures/in/lorem.txt | ./bin/truwrap -s "Hello %s!" World --left ${left} --right ${right} --width ${width}`,
				(error_, out_) => {
					t.is(error_, null)
					t.is(out_, fixture)
					t.end()
				}
			)
		})
	})
})

