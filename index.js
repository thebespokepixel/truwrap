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
var StringDecoder, _package, ansiRegex, columnify, console, truwrap, util, verbosity;

console = global.vConsole != null ? global.vConsole : global.vConsole = require('verbosity').console({
  out: process.stderr
});

_package = require('./package.json');

util = require("util");

verbosity = require('verbosity');

StringDecoder = require('string_decoder').StringDecoder;

ansiRegex = require('ansi-regex');

columnify = require('columnify');

truwrap = module.exports = function(options) {
  var _decoder, left, margin, mode, modeRegex, newlineRegex, outStream, postSpaceRegex, preSpaceRegex, ref, ref1, ref2, ref3, ref4, right, tabRegex, ttyActive, ttyWidth, width;
  left = (ref = options.left) != null ? ref : 2, right = (ref1 = options.right) != null ? ref1 : 2, width = options.width, mode = (ref2 = options.mode) != null ? ref2 : 'soft', outStream = (ref3 = options.outStream) != null ? ref3 : process.stdout, modeRegex = options.modeRegex;
  ttyActive = Boolean(outStream.isTTY) || (width != null);
  _decoder = new StringDecoder;
  outStream.setEncoding('utf8');
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
  ttyWidth = (ref4 = width != null ? width : outStream.columns) != null ? ref4 : outStream.getWindowSize()[0];
  width = ttyWidth - right - left;
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
    modeRegex = mode === 'hard' ? /\b(?![<T>]|[0-9;]+m)/g : /\S+\s+/g;
  }
  preSpaceRegex = /^\s+/;
  postSpaceRegex = /[\s]+$/;
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
        var format, indent, j, len, line, lineWidth, lines, process, token, tokens;
        if (write_ == null) {
          write_ = true;
        }
        lines = [];
        line = margin.slice(0, left);
        lineWidth = 0;
        indent = 0;
        tokens = _decoder.write(buffer_).replace(tabRegex, '\u0000<T>\u0000').replace(ansiRegex(), '\u0000$&\u0000').replace(modeRegex, '\u0000$&\u0000').split("\u0000");
        process = {
          hard: function(token_) {
            var i, j, ref5, ref6, results;
            if (token_.length <= width) {
              return format.line(token_);
            } else {
              results = [];
              for (i = j = 0, ref5 = token_.length, ref6 = width; ref6 > 0 ? j <= ref5 : j >= ref5; i = j += ref6) {
                results.push(format.line(token_.slice(i, i + width)));
              }
              return results;
            }
          },
          soft: function(token_) {
            return format.line(token_);
          }
        };
        format = {
          newline: function(token_) {
            lines.push(line);
            line = margin.slice(0, left);
            line += margin.slice(0, indent);
            lineWidth = indent;
            if (token_ != null) {
              return format.linefit(token_.replace(preSpaceRegex, ''));
            }
          },
          linefit: function(token_) {
            if (token_ === "<T>") {
              line += margin.slice(0, 4);
              lineWidth += 4;
              indent += 4;
            } else if (mode === 'soft' && token_.length > width - indent) {
              return format.linefit(token_.slice(0, +(width - indent - 4) + 1 || 9e9) + "…");
            } else if (lineWidth + token_.length > width) {
              line = line.replace(postSpaceRegex, '');
              return format.newline(token_);
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
              subtokens = token_.split(newlineRegex);
              format.linefit(subtokens.shift());
              indent = 0;
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
        line = line.replace(postSpaceRegex, '');
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
