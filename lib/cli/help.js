'use strict';

/*
	truwrap
	Command line help
 */
var console, deepAssign, outputPage, setupPage, terminalFeatures, trucolor, truwrap;

console = global.vConsole;

trucolor = require('trucolor');

truwrap = require('../..');

deepAssign = require('deep-assign');

terminalFeatures = require('term-ng');

setupPage = function(clr) {
  var img, page;
  if (terminalFeatures.images) {
    img = {
      space: "\t",
      cc: new truwrap.Image({
        name: 'logo',
        file: __dirname + '/../../media/CCLogo.png',
        height: 3
      })
    };
  } else {
    img = {
      space: "",
      cc: {
        render: function() {
          return "";
        }
      }
    };
  }
  page = {
    images: img,
    header: function() {
      return [clr.title + " " + (truwrap.getName()) + clr.titleOut, img.space + " " + (truwrap.getDescription()), img.space + " " + clr.grey + (trucolor.getVersion()) + clr.dark].join("\n");
    },
    synopsis: clr.title + "Synopsis:" + clr.titleOut + "\n" + clr.command + (truwrap.getName()) + " " + clr.option + "[OPTIONS]",
    usage: clr.title + "Usage:" + clr.titleOut + "\nReads unformatted text from stdin and typographically applies paragraph wrapping it for the currently active tty.",
    epilogue: "" + clr.title + (truwrap.getName()) + clr.normal + " is an open source component of CryptoComposite\'s toolset.\n" + clr.title + "© 2014-2016 CryptoComposite. " + clr.grey + "Released under the MIT License." + clr.normal + "\n" + clr.grey + "Documentation/Issues/Contributions @ http://github.com/MarkGriffiths/trucolor" + clr.normal + "\n"
  };
  return page;
};

outputPage = function(yargs_, page_) {
  var container, contentWidth, renderer, windowWidth;
  container = truwrap({
    mode: 'container',
    outStream: process.stderr
  });
  windowWidth = container.getWidth();
  renderer = truwrap({
    left: 2,
    right: -2,
    mode: 'soft',
    outStream: process.stderr
  });
  contentWidth = renderer.getWidth();
  yargs_.usage(' ');
  yargs_.wrap(contentWidth);
  container.write('\n');
  container.write(page_.images.cc.render({
    nobreak: false,
    align: 2
  }));
  container.write(page_.header());
  renderer["break"]();
  container.write("–".repeat(windowWidth));
  renderer["break"](2);
  renderer.write(page_.synopsis);
  renderer.write(yargs_.help());
  renderer["break"]();
  renderer.write(page_.usage);
  renderer["break"](2);
  renderer.write(page_.epilogue);
  return renderer["break"]();
};

module.exports = function(yargs_) {
  return trucolor.simplePalette(function(basic) {
    return trucolor.bulk({
      bright: 'bold rgb(255,255,255)',
      dark: '#333'
    }, {}, function(clr) {
      return outputPage(yargs_, setupPage(deepAssign(clr, basic)));
    });
  });
};
