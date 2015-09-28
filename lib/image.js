'use strict'

/*
	truwrap (v0.1.9)
	Read an image into the console. Currently for iTerm2.9.x nightlies.
 */
var Image, fs, path

fs = require('fs')

path = require('path')

Image = (function () {
  Image.prototype.prefix = '\x1b]1337;File=inline=1;'

  Image.prototype.suffix = '\x07'

  function Image (source_) {
    var file, name
    file = source_.file
    name = source_.name
    this.width = source_.width
    this.height = source_.height
    this.data = new Buffer(fs.readFileSync(fs.realpathSync(file)))
    if (this.height != null) {
      if (this.width == null) {
        this.width = 'auto'
      }
    }
    if (this.width != null) {
      if (this.height == null) {
        this.height = 'auto'
      }
    }
    this.config = 'size=' + this.data.length + ';'
    if (this.width != null) {
      this.config += 'width=' + this.width + ';'
    }
    if (this.height != null) {
      this.config += 'height=' + this.height + ';'
    }
    this.config += 'name=' + new Buffer(name || path.basename(file)).toString('base64')
  }

  Image.prototype.render = function (options_) {
    var align, aspect, newline, nobreak, stretch
    align = options_.align
    stretch = options_.stretch
    nobreak = options_.nobreak
    if (stretch != null) {
      aspect = 'preserveAspectRatio=0;'
    }
    if (aspect == null) {
      aspect = ''
    }
    if (nobreak == null) {
      newline = '\n'
    }
    if (align != null) {
      newline = '\x1bH\x1b[' + align + 'A'
    }
    if (newline == null) {
      newline = ''
    }
    return '' + this.prefix + aspect + this.config + ':' + (this.data.toString('base64')) + this.suffix + newline
  }

  Image.prototype.stream = function (wStream, options_) {
    if (wStream == null) {
      wStream = process.stdout
    }
    if (options_ == null) {
      options_ = {}
    }
    return wStream.write(this.render(options_))
  }

  return Image

})()

module.exports = Image
