"use strict";

/*
	truwrap
	Smart word wrap, colums and inline images for the CLI
 */
var _package, ansiRegex, argv, console, getStdin, outStream, renderPanel, renderSettings, renderer, truwrap, updateNotifier, util, writer, yargs,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

truwrap = require('../..');

ansiRegex = require('ansi-regex');

getStdin = require('get-stdin');

util = require('util');

updateNotifier = require('update-notifier');

console = global.vConsole;

_package = require('../../package.json');

yargs = require('yargs').options({
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
    "default": false
  },
  l: {
    alias: 'left',
    describe: 'Left margin',
    requiresArg: true,
    "default": 2
  },
  r: {
    alias: 'right',
    describe: 'Right margin',
    requiresArg: true,
    "default": 2
  },
  w: {
    alias: 'width',
    describe: 'Set total width. Overrides terminal window’s width.',
    requiresArg: true,
    nargs: 1
  },
  m: {
    alias: 'mode',
    choices: ['hard', 'soft', 'keep', 'container'],
    describe: 'Wrapping mode',
    "default": 'soft',
    requiresArg: true
  },
  s: {
    alias: 'stamp',
    boolean: true,
    describe: 'Print arguments rather than stdin. printf-style options supported.'
  },
  p: {
    alias: 'panel',
    describe: 'Render a tabular panel into the available console width.'
  },
  d: {
    alias: 'delimiter',
    describe: 'The column delimiter when reading data for a panel.',
    requiresArg: true,
    "default": '|'
  },
  x: {
    alias: 'regex',
    describe: 'Character run selection regex.',
    requiresArg: true
  },
  color: {
    describe: 'Force color depth --color=256|16m. Disable with --no-color'
  }
}).showHelpOnFail(false, "Use 'wrap --help' for help.");

argv = yargs.argv;

outStream = process.stdout;

if (argv.version) {
  process.stdout.write(truwrap.getVersion(argv.version));
  process.exit(0);
}

if (argv.verbose) {
  switch (argv.verbose) {
    case 1:
      console.verbosity(4);
      console.log(':Verbose mode:');
      break;
    case 2:
      console.verbosity(5);
      console.log(':Extra-Verbose mode:');
      console.yargs(argv);
  }
}

updateNotifier({
  pkg: _package
}).notify();

if (argv.stderr) {
  outStream = process.stderr;
}

if (argv.help) {
  require('./help')(yargs);
  process.exit(0);
}

if (argv.panel) {
  renderPanel = true;
}

renderSettings = {
  encoding: argv.encoding,
  left: argv.left,
  right: argv.right,
  mode: argv.mode,
  outStream: outStream
};

if (argv.regex != null) {
  renderSettings.modeRegex = new RegExp(argv.regex, 'g');
}

if (argv.width != null) {
  renderSettings.width = argv.width;
}

renderer = (require("../.."))(renderSettings);

writer = function(buffer_) {
  var col, colIdx, columnData, configuration, contentCount, fieldCount, longIdx, maxCols, row, rowIdx, spacerCols, tableData;
  longIdx = 0;
  maxCols = 0;
  spacerCols = [];
  tableData = (function() {
    var fn, i, j, len, len1, ref, ref1, results;
    ref = buffer_.toString().split('\n');
    results = [];
    for (rowIdx = i = 0, len = ref.length; i < len; rowIdx = ++i) {
      row = ref[rowIdx];
      columnData = {};
      fieldCount = 0;
      contentCount = 0;
      ref1 = row.split(argv.delimiter);
      fn = function(col, colIdx) {
        if (col === ':space:') {
          spacerCols.push(colIdx);
          columnData["spacer" + colIdx] = ' ';
        } else if (indexOf.call(spacerCols, colIdx) >= 0) {
          columnData["spacer" + colIdx] = ' ';
        } else {
          columnData["c" + colIdx] = col;
        }
      };
      for (colIdx = j = 0, len1 = ref1.length; j < len1; colIdx = ++j) {
        col = ref1[colIdx];
        fn(col, colIdx);
      }
      if (colIdx > maxCols) {
        maxCols = colIdx;
        longIdx = rowIdx;
      }
      results.push(columnData);
    }
    return results;
  })();
  configuration = {};
  Object.keys(tableData[longIdx]).forEach(function(idx_) {
    if (idx_.includes('spacer')) {
      return configuration[idx_] = {
        maxWidth: 16,
        minWidth: 4
      };
    } else {
      return configuration[idx_] = {
        maxWidth: (renderer.getWidth() - spacerCols.length * 16) / (maxCols - spacerCols.length),
        minWidth: (renderer.getWidth() - spacerCols.length * 4) / (maxCols - spacerCols.length)
      };
    }
  });
  return renderer.write(renderer.panel({
    content: tableData,
    layout: {
      showHeaders: false,
      config: configuration
    }
  }));
};

getStdin().then(function(buffer_) {
  if (renderPanel !== true) {
    return renderer.write(buffer_);
  } else {
    return writer(buffer_);
  }
});

if (argv.stamp) {
  writer(util.format.apply(this, argv._));
  process.exit(0);
}
