'use strict'

/*
 truwrap (v0.1.11)
 Smart word wrap, colums and inline images for the CLI
 */
var _truwrap, ansiRegex, argv, outStream, ref, renderPanel, renderer, rightMargin, ttyWidth, yargs

_truwrap = require('../..')

ansiRegex = require('ansi-regex')

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
    describe: 'Width. Sets right margin to [console-width - width - left margin - left margin].',
    requiresArg: true,
    nargs: 1
  },
  m: {
    alias: 'mode',
    choices: ['hard', 'soft', 'regex'],
    describe: 'Wrapping mode: hard (break long lines), soft (keep white space) or regex (use the --regex option)',
    'default': 'hard',
    requiresArg: true
  },
  p: {
    alias: 'panel',
    describe: 'Render a panel into the available console width.'
  },
  d: {
    alias: 'delimiter',
    describe: 'The column delimiter when rendering a panel. The default column delimiter is | (vertical bar).',
    requiresArg: true,
    'default': '|'
  },
  x: {
    alias: 'regex',
    describe: 'Character run selection regex.',
    requiresArg: true
  }
}).showHelpOnFail(false, "Use 'wrap --help' for help.")

argv = yargs.argv

outStream = process.stderr

rightMargin = -argv.right

if (argv.version) {
  console.log(_truwrap.getVersion(argv.version > 1))
  process.exit(0)
}

if (argv.verbose) {
  console.log('Verbose mode:')
  console.dir(argv)
  global.verbose = true
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
  left: argv.left,
  right: rightMargin,
  mode: argv.mode,
  outStream: outStream
})

process.stdin.setEncoding('utf8')

process.stdin.on('readable', function () {
  var chunk, col, columnData, contentCount, i, j, len, line, maxContent, maxSpacers, spacerCols, spacerCount, tableData, temp
  chunk = process.stdin.read()
  if (chunk != null) {
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
              return columnData['spacer' + i] = ' '
            } else {
              contentCount += col.replace(ansiRegex(), '').length
              return columnData['c' + i] = col
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
})

process.stdin.on('end', function () {
  renderer.write('\r')
  return renderer.end()
})
