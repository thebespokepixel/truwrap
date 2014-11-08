'use strict';

/*
 console-wrap (v0.0.4-579)
 Smarter text wrapping
 */
var ansiRegex, consoleWrap, _package;

_package = require("./package.json");

ansiRegex = require("ansi-regex");

consoleWrap = module.exports = function(options) {
  var left, margin, mode, modeRegex, newlineRegex, outStream, postSpaceRegex, preSpaceRegex, right, tabRegex, ttyActive, ttyWidth, width, _ref;
  left = options.left, right = options.right, mode = options.mode, outStream = options.outStream, modeRegex = options.modeRegex;
  if (outStream == null) {
    outStream = process.stdout;
  }
  ttyActive = Boolean(outStream.isTTY);
  if (!ttyActive) {
    return function(text_) {
      return outStream.write(text_);
    };
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
  if (modeRegex == null) {
    modeRegex = (function() {
      if (mode === 'hard') {
        return /\b(?![0-9;]+m)/g;
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
  return function(text_) {
    var format, line, lineWidth, lines, process, token, tokens, _i, _len;
    lines = [];
    line = '';
    lineWidth = 0;
    tokens = text_.toString().replace(tabRegex, '    ').replace(ansiRegex(), '\x00$&\x00').replace(modeRegex, '\x00$&\x00').split("\x00");
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
        lineWidth = 0;
        if (token_ != null) {
          return format.linefit(token_.replace(preSpaceRegex, ''));
        }
      },
      linefit: function(token_) {
        if (mode === 'soft' && token_.length > width) {
          return format.linefit(token_.slice(0, +(width - 4) + 1 || 9e9) + "...");
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
    return outStream.write(lines.join('\n'));
  };
};

consoleWrap.getVersion = function(isLong) {
  if (isLong) {
    return _package.name + " v" + _package.version;
  } else {
    return _package.version;
  }
};
