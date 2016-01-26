'use strict';

/*
	truwrap
	Command line help
 */
var clr, console, deepAssign, terminalFeatures, trucolor, truwrap;

console = global.vConsole;

trucolor = require('trucolor');

truwrap = require('../..');

deepAssign = require('deep-assign');

terminalFeatures = require('term-ng');

clr = deepAssign(trucolor.simplePalette(), trucolor.bulk({}, {
  bright: 'bold rgb(255,255,255)',
  dark: '#333'
}));

module.exports = function(yargs_, helpPage_) {
  var container, contentWidth, epilogue, header, images, renderer, synopsis, usage, windowWidth;
  images = terminalFeatures.images ? {
    space: "\t",
    cc: new truwrap.Image({
      name: 'logo',
      file: __dirname + '/../../media/CCLogo.png',
      height: 3
    })
  } : {
    space: "",
    cc: {
      render: function() {
        return "";
      }
    }
  };
  header = function() {
    return [clr.title + " " + (truwrap.getName()) + clr.title.out, images.space + " " + (truwrap.getDescription()), images.space + " " + clr.grey + (truwrap.getVersion()) + clr.dark].join("\n");
  };
  synopsis = clr.title + "Synopsis:" + clr.title.out + "\n" + clr.command + (truwrap.getName()) + " " + clr.option + "[OPTIONS]";
  usage = clr.title + "Usage:" + clr.title.out + "\nReads unformatted text from stdin and typographically applies paragraph wrapping it for the currently active tty.";
  epilogue = "" + clr.title + (truwrap.getName()) + clr.normal + " is an open source component of CryptoComposite\'s toolset.\n" + clr.title + "© 2014-2016 CryptoComposite. " + clr.grey + "Released under the MIT License." + clr.normal + "\n" + clr.grey + "Documentation/Issues/Contributions @ http://github.com/MarkGriffiths/trucolor" + clr.normal + "\n";
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
  container.write(images.cc.render({
    nobreak: false,
    align: 2
  }));
  container.write(header());
  renderer["break"]();
  container.write("–".repeat(windowWidth));
  renderer["break"](2);
  renderer.write(synopsis);
  renderer.write(yargs_.help());
  renderer["break"]();
  renderer.write(usage);
  renderer["break"](2);
  renderer.write(epilogue);
  return renderer["break"]();
};
