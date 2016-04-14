'use strict';

/*
	truwrap
	Smarter 24bit console text wrapping

	Copyright (c) 2016 Mark Griffiths

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use, copy,
	modify, merge, publish, distribute, sublicense, and/or sell copies
	of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var StringDecoder, _package, ansiRegex, clr, columnify, console, trucolor, truwrap, util, verbosity;

console = global.vConsole != null ? global.vConsole : global.vConsole = require('verbosity').console({
  out: process.stderr
});

_package = require('./package.json');

util = require("util");

verbosity = require('verbosity');

StringDecoder = require('string_decoder').StringDecoder;

ansiRegex = require('ansi-regex');

columnify = require('columnify');

trucolor = require('trucolor');

clr = trucolor.simplePalette();

truwrap = module.exports = function(options) {
  var _decoder, left, margin, mode, modeRegex, newlineRegex, outStream, ref, ref1, ref2, ref3, ref4, right, tabRegex, ttyActive, ttyWidth, width;
  left = (ref = options.left) != null ? ref : 2, right = (ref1 = options.right) != null ? ref1 : 2, width = options.width, mode = (ref2 = options.mode) != null ? ref2 : 'soft', outStream = (ref3 = options.outStream) != null ? ref3 : process.stdout, modeRegex = options.modeRegex;
  ttyActive = Boolean(outStream.isTTY || (width != null) || mode.match(/keep|container/));
  _decoder = new StringDecoder;
  if (!ttyActive) {
    console.debug("Non-TTY: width: Infinity");
    return (function() {
      return {
        isTTY: false,
        end: function() {
          if (outStream._isStdio) {
            return function() {
              return outStream.write(_decoder.end());
            };
          } else {
            return function() {
              return outStream.end(_decoder.end());
            };
          }
        },
        getWidth: function() {
          return Infinity;
        },
        panel: function(panel_) {
          return columnify(panel_.content, panel_.layout);
        },
        write: function(buffer_) {
          return outStream.write(_decoder.write(buffer_));
        }
      };
    })();
  }
  if (outStream.isTTY) {
    outStream.setEncoding('utf8');
  }
  ttyWidth = (ref4 = width != null ? width : outStream.columns) != null ? ref4 : outStream.getWindowSize()[0];
  width = ttyWidth - right - left > 1 ? ttyWidth - right - left : 2;
  if (mode === 'container') {
    console.debug("Container: width: " + ttyWidth + ", mode: " + mode);
    return (function() {
      return {
        end: function() {
          if (outStream._isStdio) {
            return function() {
              return outStream.write(_decoder.end());
            };
          } else {
            return function() {
              return outStream.end(_decoder.end());
            };
          }
        },
        getWidth: function() {
          return ttyWidth;
        },
        write: function(buffer_) {
          return outStream.write(_decoder.write(buffer_));
        }
      };
    })();
  }
  if (modeRegex == null) {
    modeRegex = (function() {
      switch (mode) {
        case 'hard':
          return /\b(?![<T>]|[0-9;]+m)/g;
        case 'keep':
          return /^.*$/mg;
        default:
          return /\S+\s+/g;
      }
    })();
  }
  tabRegex = /\t/g;
  newlineRegex = /\n/;
  margin = new Array(ttyWidth).join(' ');
  console.debug("Renderer: left: " + left + ", right: " + right + ", width: " + width + ", mode: " + mode);
  return (function() {
    return {
      end: function() {
        if (outStream._isStdio) {
          return function() {
            return outStream.write(_decoder.end());
          };
        } else {
          return function() {
            return outStream.end(_decoder.end());
          };
        }
      },
      getWidth: function() {
        return width;
      },
      panel: function(panel_) {
        return columnify(panel_.content, panel_.layout);
      },
      "break": function(count) {
        if (count == null) {
          count = 1;
        }
        return outStream.write("\n".repeat(count));
      },
      clear: function() {
        return outStream.write("\n");
      },
      write: function(buffer_, write_) {
        var format, j, len, line, lineBlock, lineWidth, lines, process, token, tokens;
        if (write_ == null) {
          write_ = true;
        }
        lines = [];
        line = margin.slice(0, left);
        lineWidth = 0;
        lineBlock = false;
        tokens = _decoder.write(buffer_).replace(tabRegex, '\u0000<T>\u0000').replace(ansiRegex(), '\u0000$&\u0000').replace(modeRegex, '\u0000$&\u0000').split("\u0000");
        process = {
          hard: function(token_) {
            var i, j, ref5, ref6, results;
            if (token_.length <= width) {
              return format.line(token_);
            } else {
              results = [];
              for (i = j = 0, ref5 = token_.length, ref6 = width; ref6 > 0 ? j < ref5 : j > ref5; i = j += ref6) {
                results.push(format.line(token_.slice(i, i + width)));
              }
              return results;
            }
          },
          soft: function(token_) {
            return format.line(token_);
          },
          keep: function(token_) {
            if (token_.length > width) {
              console.debug("1st keep fitting: " + token_);
              format.line(token_.slice(0, width - 1) + clr.normal + "…");
              return lineBlock = true;
            } else {
              return format.line(token_);
            }
          }
        };
        format = {
          newline: function(token_) {
            lines.push(line);
            line = margin.slice(0, left);
            lineWidth = 0;
            lineBlock = false;
            if (token_ != null) {
              return format.linefit(token_.trimLeft());
            }
          },
          linefit: function(token_) {
            var diff, ref5;
            if (token_ === "<T>") {

            } else if (lineBlock) {

            } else if (mode === 'hard' && lineWidth + token_.length > width) {
              line = line.trimLeft();
              diff = lineWidth - line.length;
              lineWidth += diff;
              line = "" + margin.slice(0, left) + line;
              line += token_.slice(0, width - lineWidth);
              format.newline(token_.slice(width - lineWidth));
            } else if (mode === 'soft' && token_.length > width) {
              console.debug("Soft fitting: " + token_);
              return format.linefit(token_.slice(0, +(width - 2) + 1 || 9e9) + clr.normal + "…");
            } else if (mode === 'keep' && lineWidth + token_.length >= width) {
              switch (width - lineWidth) {
                case width:
                  console.debug("2nd keep commit: " + token_ + ".");
                  line += token_.slice(0, width - lineWidth - 1) + clr.normal + "…";
                  break;
                case 0:
                  console.debug("2nd keep set ellipsis: " + token_ + ".");
                  [].splice.apply(line, [0, (-1) - 0].concat(ref5 = clr.normal + '…')), ref5;
                  break;
                case 1:
                  console.debug("2nd keep add ellipsis: " + token_ + ".");
                  line += clr.normal + '…';
                  break;
                default:
                  console.debug("2nd keep fitting: " + token_ + ".");
                  line += token_.slice(0, width - lineWidth - 1) + clr.normal + "…";
              }
              lineBlock = true;
            } else if (lineWidth + token_.length > width) {
              line = line.trimRight();
              format.newline(token_);
            } else {
              lineWidth += token_.length;
              line += token_;
            }
          },
          ansi: function(token_) {
            line += token_;
          },
          line: function(token_) {
            var results, subtokens;
            if (newlineRegex.test(token_)) {
              subtokens = token_.split("\n");
              format.linefit(subtokens.shift());
              results = [];
              while (subtokens.length) {
                results.push(format.newline(subtokens.shift()));
              }
              return results;
            } else {
              return format.linefit(token_);
            }
          }
        };
        for (j = 0, len = tokens.length; j < len; j++) {
          token = tokens[j];
          if (token !== '') {
            if (ansiRegex().test(token)) {
              format.ansi(token);
            } else {
              process[mode](token);
            }
          }
        }
        line = line.trimRight();
        lines.push(line);
        if (write_) {
          outStream.write(_decoder.write(lines.join('\n')));
        }
        return lines.join('\n');
      }
    };
  })();
};

truwrap.getName = function() {
  return _package.name;
};

truwrap.getBin = function() {
  return Object.keys(_package.bin)[0];
};

truwrap.getDescription = function() {
  return _package.description;
};

truwrap.getCopyright = function() {
  return "©" + _package.copyright.year + " " + _package.copyright.owner;
};

truwrap.getBugs = function() {
  return _package.bugs.url;
};

truwrap.getVersion = function(long_) {
  var version;
  if (long_ == null) {
    long_ = 1;
  }
  version = _package.build_number > 0 ? _package.version + "-Δ" + _package.build_number : "" + _package.version;
  switch (long_) {
    case 3:
      return "v" + version;
    case 2:
      return _package.name + " v" + version;
    default:
      return "" + version;
  }
};

truwrap.Image = require('./lib/image');
