(function() {
  'use strict';

  /*
   truwrap (v0.0.5-98) : Smart word wrap
   Command line help
   */
  var _truwrap, clr, img, page;

  _truwrap = require('../../index');

  clr = {
    grey: "\x1b[38;2;100;100;100m",
    normal: "\x1b[0;38;2;200;200;200m"
  };

  img = {
    cc: new _truwrap.image({
      name: 'logo',
      file: __dirname + '/../../media/CCLogo.png',
      height: 3
    })
  };

  page = {
    header: "" + clr.normal + (_truwrap.getName()) + "\n" + clr.grey + "v" + (_truwrap.getVersion()) + clr.normal,
    usage: "CLI Usage:\n  " + (_truwrap.getName()) + " [OPTIONS]\n",
    epilogue: (_truwrap.getName()) + " is an open source component of CryptoComposite\'s toolset.\n© 2015 CryptoComposite. Released under the MIT License.",
    examples: function(width_) {
      return {
        content: [
          {
            Margin: " ",
            Command: "truwrap",
            Result: ""
          }, {
            Command: "",
            Result: "\n\n"
          }
        ],
        layout: {
          showHeaders: false,
          config: {
            Margin: {
              minWidth: 2,
              maxWidth: 2
            },
            Command: {
              minWidth: 30,
              maxWidth: 80
            },
            Result: {
              maxWidth: width_ - 34
            }
          }
        }
      };
    }
  };

  module.exports = function(yargs_) {
    var container, contentWidth, is24bit, renderer, windowWidth;
    if (process.env.TERM_COLOR === '24bit') {
      is24bit = true;
    }
    container = _truwrap({
      mode: 'container',
      outStream: process.stderr
    });
    windowWidth = container.getWidth();
    if (!is24bit) {
      yargs_.usage(page.usage);
      yargs_.epilogue(page.epilogue);
      yargs_.wrap(windowWidth).showHelp();
    }
    renderer = _truwrap({
      left: 2,
      right: -2,
      mode: 'soft',
      outStream: process.stderr
    });
    contentWidth = renderer.getWidth();
    container.write("\n");
    container.write(img.cc.render({
      nobreak: true,
      align: 1
    }));
    container.write(page.header);
    renderer.write(page.usage);
    if (page.examples != null) {
      container.write("Examples:\n" + renderer.panel(page.examples(windowWidth)));
    }
    renderer.write("\n");
    renderer.write(yargs_.wrap(container.isTTY && windowWidth(-1 || 0)).help);
    console.dir(yargs_.help);
    return container.write("\n");
  };

}).call(this);
