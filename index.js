'use strict'

/*
	truwrap (v0.1.19)
	Smarter 24bit console text wrapping

	Copyright (c) 2015 CryptoComposite

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
var StringDecoder, _package, ansiRegex, columnify, truwrap

_package = require('./package.json')

StringDecoder = require('string_decoder').StringDecoder

ansiRegex = require('ansi-regex')

columnify = require('columnify')

truwrap = module.exports = function (options) {
  var _decoder, encoding, left, margin, mode, modeRegex, newlineRegex, outStream, postSpaceRegex, preSpaceRegex, ref, right, tabRegex, ttyActive, ttyWidth, width
  left = options.left
  right = options.right
  mode = options.mode
  outStream = options.outStream
  encoding = options.encoding
  modeRegex = options.modeRegex
  _decoder = new StringDecoder(encoding != null ? encoding : encoding = 'utf8')
  if (outStream == null) {
    outStream = process.stdout
  }
  ttyActive = Boolean(outStream.isTTY)
  outStream.setEncoding(encoding)
  if (!ttyActive) {
    return (function () {
      return {
        isTTY: false,
        end: function () {
          return outStream._isStdio || outStream.end()
        },
        getWidth: function () {
          return Infinity
        },
        write: function (buffer_) {
          return outStream.write(_decoder.write(buffer_))
        }
      }
    })()
  }
  ttyWidth = (ref = outStream.columns) != null ? ref : outStream.getWindowSize()[0]
  if (left == null) {
    left = 0
  }
  if (right == null) {
    right = ttyWidth
  }
  right < 0 && (right = ttyWidth + right)
  width = right - left
  if (mode == null) {
    mode = 'soft'
  }
  if (mode === 'container') {
    return (function () {
      return {
        end: function () {
          return outStream._isStdio || outStream.end()
        },
        getWidth: function () {
          return ttyWidth
        },
        write: function (buffer_) {
          return outStream.write(_decoder.write(buffer_))
        }
      }
    })()
  }
  if (modeRegex == null) {
    modeRegex = (function () {
      if (mode === 'hard') {
        return /\b(?![<T>]|[0-9;]+m)/g
      } else {
        return /\S+\s+/g
      }
    })()
  }
  preSpaceRegex = /^\s+/
  postSpaceRegex = /\s+$/
  tabRegex = /\t/g
  newlineRegex = /\n/
  margin = new Array(ttyWidth).join(' ')
  return (function () {
    return {
      end: function () {
        return outStream._isStdio || outStream.end()
      },
      getWidth: function () {
        return width
      },
      panel: function (panel_) {
        return columnify(panel_.content, panel_.layout)
      },
      write: function (buffer_, write_) {
        var format, indent, j, len, line, lineWidth, lines, process, token, tokens
        if (write_ == null) {
          write_ = true
        }
        lines = []
        line = margin.slice(0, +(left - 1) + 1 || 9e9)
        lineWidth = 0
        indent = 0
        tokens = _decoder.write(buffer_).replace(tabRegex, '\x00<T>\x00').replace(ansiRegex(), '\x00$&\x00').replace(modeRegex, '\x00$&\x00').split('\x00')
        process = {
          hard: function (token_) {
            var i, j, ref1, ref2, results
            if (token_.length <= width) {
              return format.line(token_)
            } else {
              results = []
              for (i = j = 0, ref1 = token_.length, ref2 = width; ref2 > 0 ? j <= ref1 : j >= ref1; i = j += ref2) {
                results.push(format.line(token_.slice(i, +(i + width - 1) + 1 || 9e9)))
              }
              return results
            }
          },
          soft: function (token_) {
            return format.line(token_)
          }
        }
        format = {
          newline: function (token_) {
            lines.push(line)
            line = margin.slice(0, +(left - 1) + 1 || 9e9)
            if (indent > 0) {
              line += margin.slice(0, +(indent - 1) + 1 || 9e9)
            }
            lineWidth = indent
            if (token_ != null) {
              return format.linefit(token_.replace(preSpaceRegex, ''))
            }
          },
          linefit: function (token_) {
            if (token_ === '<T>') {
              line += margin.slice(0, 4)
              lineWidth += 4
              indent += 4
            } else if (mode === 'soft' && token_.length > width - indent) {
              return format.linefit(token_.slice(0, +(width - indent - 4) + 1 || 9e9) + '...')
            } else if (lineWidth + token_.length > width) {
              line.replace(postSpaceRegex, '')
              return format.newline(token_)
            } else {
              lineWidth += token_.length
              line += token_
            }
          },
          ansi: function (token_) {
            line += token_
          },
          line: function (token_) {
            var results, subtokens
            if (newlineRegex.test(token_)) {
              subtokens = token_.split(newlineRegex)
              format.linefit(subtokens.shift())
              indent = 0
              results = []
              while (subtokens.length) {
                results.push(format.newline(subtokens.shift()))
              }
              return results
            } else {
              return format.linefit(token_)
            }
          }
        }
        for (j = 0, len = tokens.length; j < len; j++) {
          token = tokens[j]
          if (token !== '') {
            if (ansiRegex().test(token)) {
              format.ansi(token)
            } else {
              process[mode](token)
            }
          }
        }
        if (line !== '') {
          lines.push(line)
        }
        if (write_) {
          return outStream.write(lines.join('\n'))
        } else {
          return lines.join('\n')
        }
      }
    }
  })()
}

truwrap.getName = function () {
  return _package.name
}

truwrap.getVersion = function (long) {
  if (long == null) {
    long = 1
  }
  switch (long) {
    case 1:
      return '' + _package.version
    default:
      return _package.name + ' v' + _package.version
  }
}

truwrap.Image = require('./lib/image')
