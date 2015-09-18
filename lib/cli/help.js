(function() {
  'use strict';

  /*
   truwrap (v0.0.8-60) : Smart word wrap
   Command line help
   */
  var _truwrap, clr, is24bit, page;

  _truwrap = require('../../index');

  if (process.env.TERM_COLOR === '24 bit') {
    is24bit = true;
  }

  clr = {
    grey: "\x1b[38;2;100;100;100m",
    normal: "\x1b[0;38;2;200;200;200m"
  };

  page = {
    header: "\n" + clr.normal + (_truwrap.getName()) + " " + clr.grey + "v" + (_truwrap.getVersion()) + clr.normal + "\n",
    usage: "\nCLI Usage:\n" + (_truwrap.getName()) + " [OPTIONS]",
    epilogue: (_truwrap.getName()) + " is an open source component of CryptoComposite\'s toolset.\n© 2015 CryptoComposite. Released under the MIT License."
  };

  module.exports = function(yargs_) {
    var contentWidth, renderer;
    renderer = _truwrap({
      left: 2,
      right: -2,
      mode: 'soft',
      outStream: process.stderr
    });
    contentWidth = renderer.getWidth();
    yargs_.usage(page.usage);
    yargs_.epilogue(page.epilogue);
    yargs_.wrap(contentWidth);
    renderer.write(page.header);
    return renderer.write(yargs_.help());
  };

}).call(this);
