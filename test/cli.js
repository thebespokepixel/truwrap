'use strict'
import shell from 'shelljs'
import pkg from '../package.json'
import test from 'ava'

const loremWrapped0 = `Lorem ipsum dolor sit amet, consectetur
adipiscing elit, sed do eiusmod tempor
incididunt ut labore et dolore magna
aliqua. Ut enim ad minim veniam, quis
nostrud exercitation ullamco laboris
nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in
reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia
deserunt mollit anim id est laborum.`

const loremWrapped64 = `      Lorem ipsum dolor sit amet,
      consectetur adipiscing elit, sed do
      eiusmod tempor incididunt ut labore
      et dolore magna aliqua. Ut enim ad
      minim veniam, quis nostrud
      exercitation ullamco laboris nisi
      ut aliquip ex ea commodo consequat.
      Duis aute irure dolor in
      reprehenderit in voluptate velit
      esse cillum dolore eu fugiat nulla
      pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in
      culpa qui officia deserunt mollit
      anim id est laborum.`

const loremWrapped88hard = `        Lorem ipsum dolor sit amet,
        consectetur adipiscing elit, sed
        do eiusmod tempor incididunt ut
        labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis
        nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute
        irure dolor in reprehenderit in
        voluptate velit esse cillum
        dolore eu fugiat nulla pariatur
        . Excepteur sint occaecat
        cupidatat non proident, sunt in
        culpa qui officia deserunt
        mollit anim id est laborum.`

const loremWrapped22hard = `  Lorem ipsum dolor
  sit amet,
  consectetur
  adipiscing elit,
  sed do eiusmod
  tempor incididunt
  ut labore et
  dolore magna
  aliqua. Ut enim ad
  minim veniam, quis
  nostrud
  exercitation
  ullamco laboris
  nisi ut aliquip ex
  ea commodo
  consequat. Duis
  aute irure dolor
  in reprehenderit
  in voluptate velit
  esse cillum dolore
  eu fugiat nulla
  pariatur.
  Excepteur sint
  occaecat cupidatat
  non proident, sunt
  in culpa qui
  officia deserunt
  mollit anim id est
  laborum.`

var tableOne = '          One                Two           Three         Four         \n'
   tableOne += '          test 1             test 3        test 4        test 5       \n'
   tableOne += '          Longer item 1      Short2        Longer item 3 short4       \n'
   tableOne += '          Lorem ipsum        Ut enim ad    Duis aute     Excepteur    \n'
   tableOne += '          dolor sit          minim veniam, irure dolor   sint occaecat\n'
   tableOne += '          amet,              quis nostrud  in            cupidatat non\n'
   tableOne += '          consectetur        exercitation  reprehenderit proident,    \n'
   tableOne += '          adipiscing         ullamco       in voluptate  sunt in culpa\n'
   tableOne += '          elit, sed do       laboris nisi  velit esse    qui officia  \n'
   tableOne += '          eiusmod            ut aliquip ex cillum dolore deserunt     \n'
   tableOne += '          tempor             ea commodo    eu fugiat     mollit anim  \n'
   tableOne += '          incididunt ut      consequat.    nulla         id est       \n'
   tableOne += '          labore et                        pariatur.     laborum.     \n'
   tableOne += '          dolore magna                                                \n'
   tableOne += '          aliqua.                                                     \n'
   tableOne += '          ♣                  ♥             ♠             ♦'

test.cb(`Module name/version is '${pkg.name}'.`, t => {
	shell.exec('/usr/bin/env node ../lib/cli/index.js -vv', {silent: true}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, `${pkg.name} v${pkg.version}`)
		t.end()
	})
})

test.cb('Soft wrap test to width = 40, left = 0, right = 0', t => {
	shell.exec('cat ./fixtures/lorem.txt | /usr/bin/env node ../lib/cli/index.js --left 0 --right 0 --width 40', {silent: true}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, loremWrapped0)
		t.end()
	})
})

test.cb('Soft wrap test to width = 40, left = 6, right = 4', t => {
	shell.exec('cat ./fixtures/lorem.txt | /usr/bin/env node ../lib/cli/index.js --left 6 --right 4 --width 40', {silent: true}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, loremWrapped64)
		t.end()
	})
})

test.cb('Hard wrap test to width = 40, left = 8, right = 8', t => {
	shell.exec('cat ./fixtures/lorem.txt | /usr/bin/env node ../lib/cli/index.js --left 8 --right 8 --width 40 --mode hard', {silent: true}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, loremWrapped88hard)
		t.end()
	})
})

test.cb('Hard wrap test to width = 20', t => {
	shell.exec('cat ./fixtures/lorem.txt | /usr/bin/env node ../lib/cli/index.js --width 20 --mode hard', {silent: true}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, loremWrapped22hard)
		t.end()
	})
})

test.cb('Stamp test: -s "Hello %s!" World --width 40', t => {
	shell.exec('/usr/bin/env node ../lib/cli/index.js -s "Hello %s!" World --width 40', {silent: true}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, '  Hello World!')
		t.end()
	})
})

test.cb('Panel test: width = 70, left = 10', t => {
	shell.exec('cat ./fixtures/table.txt | /usr/bin/env node ../lib/cli/index.js --panel --width 70 --left 10', {silent: true}, (code_, out_) => {
		t.is(code_, 0)
		t.is(out_, tableOne)
		t.end()
	})
})
