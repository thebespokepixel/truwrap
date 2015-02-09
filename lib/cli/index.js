"use strict";

/*
 truwrap (v0.0.5-32)
 Smart word wrap, colums and inline images for the CLI
 */
var argv, yargs, _truwrap;

_truwrap = require("../../index");

yargs = require('yargs').strict().options({
  help: {
    alias: 'h',
    describe: 'Display this help.'
  },
  version: {
    alias: 'v',
    count: true,
    describe: 'Return a long version decription.'
  },
  verbose: {
    alias: 'V',
    boolean: true,
    describe: 'Be verbose. Useful for debugging.\n'
  },
  left: {
    alias: 'l',
    describe: 'Left margin'
  },
  right: {
    alias: 'r',
    describe: 'Right margin'
  },
  width: {
    alias: 'w',
    describe: 'Width. Sets right margin to [console width - left margin] - width.'
  },
  mode: {
    alias: 'm',
    describe: 'Wrapping mode: hard (break long lines) or Soft (keep white space)'
  },
  regex: {
    alias: 'x',
    describe: 'Character run selection regex.'
  }
}).showHelpOnFail(false, "Use 'wrap --help' for user manual");

argv = yargs.argv;

if (argv.version) {
  console.log(_truwrap.getVersion(argv.version > 1));
  process.exit(0);
}

if (argv.verbose) {
  console.log('Verbose mode:');
  console.dir(argv._);
  global.verbose = true;
}

if (argv.help) {
  require('./help')(yargs, argv.help);
  process.exit(0);
}
