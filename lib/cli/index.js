'use strict'

/*
 truwrap (v0.1.17)
 Smart word wrap, colums and inline images for the CLI
 */
var _truwrap, ansiRegex, argv, console, outStream, ref, renderPanel, renderer, rightMargin, ttyWidth, util, verbosity, writer, yargs

_truwrap = require('../..')

ansiRegex = require('ansi-regex')

util = require('util')

verbosity = require('@thebespokepixel/verbosity')

console = verbosity.console({
  out: process.stderr
})

yargs = require('yargs').strict().options({
  h: {
    alias: 'help',
    describe: 'Display this help.'
  },
  v: {
    alias: 'version',
    count: true,
    describe: 'Return the current version on stdout. -vv Return name & version.'
  },
  V: {
    alias: 'verbose',
    count: true,
    describe: 'Be verbose. -VV Be loquacious.'
  },
  o: {
    alias: 'stderr',
    boolean: true,
    describe: 'Use stderr rather than stdout',
    'default': false
  },
  l: {
    alias: 'left',
    describe: 'Left margin',
    requiresArg: true,
    'default': 2
  },
  r: {
    alias: 'right',
    describe: 'Right margin',
    requiresArg: true,
    'default': 2
  },
  w: {
    alias: 'width',
    describe: 'Width. Overrides right margin.',
    requiresArg: true,
    nargs: 1
  },
  m: {
    alias: 'mode',
    choices: ['hard', 'soft'],
    describe: 'Wrapping mode: hard (break long lines), soft (keep white space)',
    'default': 'hard',
    requiresArg: true
  },
  e: {
    alias: 'encoding',
    describe: 'Set encoding.',
    'default': 'utf8'
  },
  s: {
    alias: 'stamp',
    boolean: true,
    describe: 'Print arguments rather than stdin. printf-style options supported.'
  },
  t: {
    alias: 'table',
    describe: 'Render a table into the available console width.'
  },
  d: {
    alias: 'delimiter',
    describe: 'The column delimiter when rendering a table.',
    requiresArg: true,
    'default': '|'
  },
  x: {
    alias: 'regex',
    describe: 'Character run selection regex. Overrides --mode',
    requiresArg: true
  }
}).showHelpOnFail(false, "Use 'wrap --help' for help.")

argv = yargs.argv

outStream = process.stdout

rightMargin = -argv.right

if (argv.version) {
  process.stdout.write(_truwrap.getVersion(argv.version))
  process.exit(0)
}

if (argv.verbose) {
  switch (argv.verbose) {
    case 1:
      console.verbosity(4)
      console.log(':Verbose mode:')
      break
    case 2:
      console.verbosity(5)
      console.log(':Extra-Verbose mode:')
      console.yargs(argv)
  }
}

if (argv.stdout) {
  outStream = process.stdout
}

if (argv.help) {
  require('./help')(yargs)
  process.exit(0)
}

if (argv.width > 0) {
  ttyWidth = (ref = outStream.columns) != null ? ref : outStream.getWindowSize()[0]
  rightMargin = -ttyWidth + (argv.width + argv.right + argv.left)
}

if (argv.panel) {
  renderPanel = true
}

renderer = (require('../..'))({
  encoding: argv.encoding,
  left: argv.left,
  right: rightMargin,
  mode: argv.mode,
  outStream: outStream
})

writer = function (chunk) {
  var col, columnData, contentCount, i, j, len, line, maxContent, maxSpacers, spacerCols, spacerCount, tableData, temp
  if (chunk == null) {
    chunk = new Buffer('\n', argv.encoding)
  }
  if (renderPanel !== true) {
    return renderer.write(chunk)
  } else {
    maxSpacers = 0
    maxContent = 0
    spacerCols = []
    tableData = (function () {
      var fn, j, k, len, len1, ref1, ref2, results
      ref1 = (chunk.toString().split(/\n/)).slice(0)
      results = []
      for (j = 0, len = ref1.length; j < len; j++) {
        line = ref1[j]
        columnData = {}
        spacerCount = 0
        contentCount = 0
        ref2 = line.split(argv.delimiter)
        fn = function (col, i) {
          if (col === ':space:') {
            spacerCount++
            spacerCols.push(i)
            columnData['spacer' + i] = ' '
          } else {
            contentCount += col.replace(ansiRegex(), '').length
            columnData['c' + i] = col
          }
        }
        for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
          col = ref2[i]
          fn(col, i)
        }
        if (spacerCount > maxSpacers) {
          maxSpacers = spacerCount
        }
        if (contentCount > maxContent) {
          maxContent = contentCount
        }
        results.push(columnData)
      }
      return results
    })()
    temp = {}
    for (j = 0, len = spacerCols.length; j < len; j++) {
      i = spacerCols[j]
      temp['spacer' + i] = {
        maxWidth: Math.floor(renderer.getWidth() / (maxSpacers + 1)),
        minWidth: Math.floor((renderer.getWidth() - maxContent) / (maxSpacers + 1))
      }
    }
    return renderer.write(renderer.panel({
      content: tableData,
      layout: {
        showHeaders: false,
        maxLineWidth: renderer.getWidth(),
        config: temp
      }
    }))
  }
}

if (argv.stamp) {
  writer(util.format.apply(this, argv._))
  process.exit(0)
}

process.stdin.setEncoding(argv.encoding)

process.stdin.on('readable', function () {
  return writer(process.stdin.read())
})

process.stdin.on('end', function () {
  renderer.write('\r')
  return renderer.end()
})
