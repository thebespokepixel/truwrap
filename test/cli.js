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
      consectetur adipiscing elit,
      sed do eiusmod tempor
      incididunt ut labore et
      dolore magna aliqua. Ut enim
      ad minim veniam, quis nostrud
      exercitation ullamco laboris
      nisi ut aliquip ex ea commodo
      consequat. Duis aute irure
      dolor in reprehenderit in
      voluptate velit esse cillum
      dolore eu fugiat nulla
      pariatur. Excepteur sint
      occaecat cupidatat non
      proident, sunt in culpa qui
      officia deserunt mollit anim
      id est laborum.`

const loremWrapped88hard = `        Lorem ipsum dolor sit
        amet, consectetur
        adipiscing elit, sed do
        eiusmod tempor
        incididunt ut labore et
        dolore magna aliqua. Ut
        enim ad minim veniam,
        quis nostrud
        exercitation ullamco
        laboris nisi ut aliquip
        ex ea commodo consequat
        . Duis aute irure dolor
        in reprehenderit in
        voluptate velit esse
        cillum dolore eu fugiat
        nulla pariatur.
        Excepteur sint occaecat
        cupidatat non proident,
        sunt in culpa qui
        officia deserunt mollit
        anim id est laborum.`

const loremWrapped22hard = `  Lorem ipsum
  dolor sit amet,
  consectetur
  adipiscing elit
  , sed do eiusmod
  tempor
  incididunt ut
  labore et dolore
  magna aliqua. Ut
  enim ad minim
  veniam, quis
  nostrud
  exercitation
  ullamco laboris
  nisi ut aliquip
  ex ea commodo
  consequat. Duis
  aute irure dolor
  in reprehenderit
  in voluptate
  velit esse
  cillum dolore eu
  fugiat nulla
  pariatur.
  Excepteur sint
  occaecat
  cupidatat non
  proident, sunt
  in culpa qui
  officia deserunt
  mollit anim id
  est laborum.`

var tableOne = '          One              Two         Three       Four       \n'
   tableOne += '          test 1           test 3      test 4      test 5     \n'
   tableOne += '          Longer item      Short2      Longer item short4     \n'
   tableOne += '          1                            3                      \n'
   tableOne += '          Lorem ipsum      Ut enim ad  Duis aute   Excepteur  \n'
   tableOne += '          dolor sit        minim       irure dolor sint       \n'
   tableOne += '          amet,            veniam,     in          occaecat   \n'
   tableOne += '          consectetur      quis        reprehende… cupidatat  \n'
   tableOne += '          adipiscing       nostrud     rit in      non        \n'
   tableOne += '          elit, sed        exercitati… voluptate   proident,  \n'
   tableOne += '          do eiusmod       on ullamco  velit esse  sunt in    \n'
   tableOne += '          tempor           laboris     cillum      culpa qui  \n'
   tableOne += '          incididunt       nisi ut     dolore eu   officia    \n'
   tableOne += '          ut labore        aliquip ex  fugiat      deserunt   \n'
   tableOne += '          et dolore        ea commodo  nulla       mollit anim\n'
   tableOne += '          magna            consequat.  pariatur.   id est     \n'
   tableOne += '          aliqua.                                  laborum.   \n'
   tableOne += '          ♣                ♥           ♠           ♦'

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
