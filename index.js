'use strict';

/*
	truwrap (v0.0.5-32)
	Smarter console text wrapping
 */
var ansiRegex, columnify, consoleWrap, _package;

_package = require("./package.json");

ansiRegex = require("ansi-regex");

columnify = require('columnify');

consoleWrap = module.exports = function(options) {
  var left, margin, mode, modeRegex, newlineRegex, outStream, postSpaceRegex, preSpaceRegex, right, tabRegex, ttyActive, ttyWidth, width, _ref;
  left = options.left, right = options.right, mode = options.mode, outStream = options.outStream, modeRegex = options.modeRegex;
  if (outStream == null) {
    outStream = process.stdout;
  }
  ttyActive = Boolean(outStream.isTTY);
  if (!ttyActive) {
    return (function() {
      return {
        isTTY: false,
        end: function() {
          return outStream._isStdio || outStream.end();
        },
        getWidth: function() {
          return Infinity;
        },
        write: function(text_) {
          return outStream.write(text_);
        }
      };
    })();
  }
  ttyWidth = (_ref = outStream.columns) != null ? _ref : outStream.getWindowSize()[0];
  if (left == null) {
    left = 0;
  }
  if (right == null) {
    right = ttyWidth;
  }
  right < 0 && (right = ttyWidth + right);
  width = right - left;
  if (mode == null) {
    mode = 'soft';
  }
  if (mode === 'container') {
    return (function() {
      return {
        end: function() {
          return outStream._isStdio || outStream.end();
        },
        getWidth: function() {
          return ttyWidth;
        },
        write: function(text_) {
          return outStream.write(text_);
        }
      };
    })();
  }
  if (modeRegex == null) {
    modeRegex = (function() {
      if (mode === 'hard') {
        return /\b(?![<T>]|[0-9;]+m)/g;
      } else {
        return /\S+\s+/g;
      }
    })();
  }
  preSpaceRegex = /^\s+/;
  postSpaceRegex = /\s+$/;
  tabRegex = /\t/g;
  newlineRegex = /\n/;
  margin = new Array(ttyWidth).join(' ');
  return (function() {
    return {
      end: function() {
        return outStream._isStdio || outStream.end();
      },
      getWidth: function() {
        return width;
      },
      panel: function(panel_) {
        return columnify(panel_.content, panel_.layout);
      },
      write: function(text_) {
        var format, indent, line, lineWidth, lines, process, token, tokens, _i, _len;
        lines = [];
        line = margin.slice(0, +(left - 1) + 1 || 9e9);
        lineWidth = 0;
        indent = 0;
        tokens = text_.toString().replace(tabRegex, '\x00<T>\x00').replace(ansiRegex(), '\x00$&\x00').replace(modeRegex, '\x00$&\x00').split("\x00");
        process = {
          hard: function(token_) {
            var i, _i, _ref1, _results;
            if (token_.length <= width) {
              return format.line(token_);
            } else {
              _results = [];
              for (i = _i = 0, _ref1 = token_.length; width > 0 ? _i <= _ref1 : _i >= _ref1; i = _i += width) {
                _results.push(format.line(token_.slice(i, +(i + width - 1) + 1 || 9e9)));
              }
              return _results;
            }
          },
          soft: function(token_) {
            return format.line(token_);
          }
        };
        format = {
          newline: function(token_) {
            lines.push(line);
            line = margin.slice(0, +(left - 1) + 1 || 9e9);
            if (indent > 0) {
              line += margin.slice(0, +(indent - 1) + 1 || 9e9);
            }
            lineWidth = indent;
            if (token_ != null) {
              return format.linefit(token_.replace(preSpaceRegex, ''));
            }
          },
          linefit: function(token_) {
            if (token_ === "<T>") {
              line += margin.slice(0, 4);
              lineWidth += 4;
              return indent += 4;
            } else if (mode === 'soft' && token_.length > width - indent) {
              return format.linefit(token_.slice(0, +(width - indent - 4) + 1 || 9e9) + "...");
            } else if (lineWidth + token_.length > width) {
              line.replace(postSpaceRegex, '');
              return format.newline(token_);
            } else {
              lineWidth += token_.length;
              return line += token_;
            }
          },
          ansi: function(token_) {
            return line += token_;
          },
          line: function(token_) {
            var subtokens, _results;
            if (newlineRegex.test(token_)) {
              subtokens = token_.split(newlineRegex);
              format.linefit(subtokens.shift());
              indent = 0;
              _results = [];
              while (subtokens.length) {
                _results.push(format.newline(subtokens.shift()));
              }
              return _results;
            } else {
              return format.linefit(token_);
            }
          }
        };
        for (_i = 0, _len = tokens.length; _i < _len; _i++) {
          token = tokens[_i];
          if (token !== '') {
            if (ansiRegex().test(token)) {
              format.ansi(token);
            } else {
              process[mode](token);
            }
          }
        }
        if (line !== '') {
          lines.push(line);
        }
        return outStream.write(lines.join('\n'));
      }
    };
  })();
};

consoleWrap.getVersion = function(isLong) {
  if (isLong) {
    return _package.name + " v" + _package.version;
  } else {
    return _package.version;
  }
};

consoleWrap.image = require('./lib/image');
