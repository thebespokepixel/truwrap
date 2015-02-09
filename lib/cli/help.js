'use strict';

/*
 truwrap (v0.0.5-32) : Smart word wrap
 Command line help
 */
var clr, img, page, _package, _wrap;

_package = require('../../package.json');

_wrap = require('../../index');

clr = {
  grey: "\x1b[38;2;100;100;100m",
  normal: "\x1b[0;38;2;200;200;200m"
};

img = {
  cc: new _wrap.image({
    name: 'logo',
    file: __dirname + '/../../media/CCLogo.png',
    height: 3
  })
};

page = {
  header: "" + clr.normal + "TruWrap " + clr.grey + "v" + _package.version + clr.normal + "\n",
  usage: "\nUsage:\n\n	wrap [OPTIONS]\n",
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

module.exports = function(yargs_, helpPage_) {
  var container, contentWidth, renderer, windowWidth;
  container = _wrap({
    mode: 'container',
    outStream: process.stdout
  });
  windowWidth = container.getWidth();
  renderer = _wrap({
    left: 2,
    right: -2,
    mode: 'soft',
    outStream: process.stderr
  });
  contentWidth = renderer.getWidth();
  container.write("\n");
  container.write(img.cc.render({
    nobreak: true
  }));
  container.write(page.header);
  renderer.write(page.usage);
  if (page.examples != null) {
    container.write("Examples:\n" + renderer.panel(page.examples(windowWidth)));
  }
  renderer.write("\n");
  yargs_.wrap(container.isTTY && windowWidth(-1 || 0)).showHelp(container.write);
  return container.write("\n");
};
