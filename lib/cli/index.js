(function() {
  "use strict";

  /*
   truwrap (v0.0.5-98)
   Smart word wrap, colums and inline images for the CLI
   */
  var _truwrap, argv, yargs;

  _truwrap = require("../../index");

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
    l: {
      alias: 'left',
      describe: 'Left margin'
    },
    r: {
      alias: 'right',
      describe: 'Right margin'
    },
    w: {
      alias: 'width',
      describe: 'Width. Sets right margin to [console width - left margin] - width.'
    },
    m: {
      alias: 'mode',
      describe: 'Wrapping mode: hard (break long lines) or Soft (keep white space)'
    },
    x: {
      alias: 'regex',
      describe: 'Character run selection regex.'
    }
  }).showHelpOnFail(false, "Use 'wrap --help' for help.");

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
    require('./help')(yargs);
    process.exit(0);
  }

}).call(this);
