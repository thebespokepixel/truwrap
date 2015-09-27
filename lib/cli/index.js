'use strict'

/*
 truwrap (v0.1.2-alpha.14)
 Smart word wrap, colums and inline images for the CLI
 */
var _truwrap, argv, outStream, ref, renderer, rightMargin, ttyWidth, yargs

_truwrap = require('../../index')

yargs = require('yargs').strict().options({
  h: {
    alias: 'help',
    describe: 'Display this help.'
  },
  v: {
    alias: 'version',
    count: true,
    describe: 'Return the current version. -vv returns a descriptive string.'
  },
  V: {
    alias: 'verbose',
    boolean: true,
    describe: 'Be verbose. Useful for debugging.'
  },
  o: {
    alias: 'stdout',
    boolean: true,
    describe: 'Use stdout rather than stderr',
    'default': false
  },
  l: {
    alias: 'left',
    describe: 'Left margin',
    'default': 2
  },
  r: {
    alias: 'right',
    describe: 'Right margin',
    'default': -2
  },
  w: {
    alias: 'width',
    describe: 'Width. Sets right margin to [console width - left margin] - width + left margin.'
  },
  m: {
    alias: 'mode',
    describe: 'Wrapping mode: hard (break long lines) or Soft (keep white space)',
    'default': 'hard'
  },
  x: {
    alias: 'regex',
    describe: 'Character run selection regex.'
  }
}).showHelpOnFail(false, "Use 'wrap --help' for help.")

argv = yargs.argv

outStream = process.stderr

rightMargin = argv.right

if (argv.version) {
  console.log(_truwrap.getVersion(argv.version > 1))
  process.exit(0)
}

if (argv.verbose) {
  console.log('Verbose mode:')
  console.dir(argv._)
  global.verbose = true
}

if (argv.stdout) {
  outStream = process.stdout
}

if (argv.help) {
  require('./help')(yargs)
  process.exit(0)
}

if (argv.width) {
  ttyWidth = (ref = outStream.columns) != null ? ref : outStream.getWindowSize()[0]
  rightMargin = (ttyWidth - argv.right) - argv.width + argv.left
}

renderer = require('../..')({
  left: argv.left,
  right: rightMargin,
  mode: argv.mode,
  outStream: outStream
})

process.stdin.setEncoding('utf8')

process.stdin.on('readable', function () {
  var chunk
  chunk = process.stdin.read()
  if (chunk != null) {
    return renderer.write(chunk)
  }
})

process.stdin.on('end', function () {
  renderer.write('\r')
  return renderer.end()
})
