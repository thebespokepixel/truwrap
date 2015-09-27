'use strict'

/*
 truwrap (v0.1.2)
 Smart word wrap, colums and inline images for the CLI
 */
var _truwrap, argv, outStream, ref, renderPanel, renderer, rightMargin, ttyWidth, yargs

_truwrap = require('../..')

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
  p: {
    alias: 'panel',
    describe: 'Render a panel into the available console width.'
  },
  d: {
    alias: 'delimiter',
    describe: 'The column delimiter when rendering a panel. The default column delimiter is a colon (:).',
    'default': '|'
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

if (argv.panel) {
  renderPanel = true
}

renderer = (require('../..'))({
  left: argv.left,
  right: rightMargin,
  mode: argv.mode,
  outStream: outStream
})

process.stdin.setEncoding('utf8')

process.stdin.on('readable', function () {
  var chunk, col, columnData, i, line, tableData
  chunk = process.stdin.read()
  if (chunk != null) {
    if (renderPanel !== true) {
      return renderer.write(chunk)
    } else {
      tableData = (function () {
        var fn, j, k, len, len1, ref1, ref2, results
        ref1 = (chunk.toString().split(/\n/)).slice(0)
        results = []
        for (j = 0, len = ref1.length; j < len; j++) {
          line = ref1[j]
          columnData = {}
          ref2 = line.split(argv.delimiter)
          fn = function (col, i) {
            if (col === ':space:') {
              return columnData['spacer'] = ' '
            } else {
              return columnData['c' + i] = col
            }
          }
          for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
            col = ref2[i]
            fn(col, i)
          }
          results.push(columnData)
        }
        return results
      })()
      return renderer.write(renderer.panel({
        content: tableData,
        layout: {
          showHeaders: false,
          maxLineWidth: renderer.getWidth(),
          config: {
            spacer: {
              minWidth: 8
            }
          }
        }
      }))
    }
  }
})

process.stdin.on('end', function () {
  renderer.write('\r')
  return renderer.end()
})
