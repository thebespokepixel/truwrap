'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var columnify = _interopDefault(require('columnify'));
var osLocale = _interopDefault(require('os-locale'));
var verbosity = require('verbosity');
var commonTags = require('common-tags');
var meta = _interopDefault(require('@thebespokepixel/meta'));
var nSelector = require('@thebespokepixel/n-selector');
var ansiRegex = _interopDefault(require('ansi-regex'));
var _merge = _interopDefault(require('lodash/merge'));
var trucolor = require('trucolor');
var fs = require('fs');
var path = require('path');
var _min = _interopDefault(require('lodash/min'));
var _max = _interopDefault(require('lodash/max'));
var _split = _interopDefault(require('lodash/split'));
var _forEach = _interopDefault(require('lodash/forEach'));

const tabRegex = /\t/g;
const newlineRegex = /\n/g;

class Tokeniser {
  constructor(tokenisingRegex) {
    this.tokenisingRegex = tokenisingRegex || function () {
      switch (renderMode.selected) {
        case 'keep':
          return /^.*$/gm;

        default:
          return /\S+\s+/g;
      }
    }();
  }

  process(source) {
    return source.replace(newlineRegex, '\u0000>/\\//__<\u0000').replace(tabRegex, '\u0000>T/\\B<\u0000').replace(ansiRegex(), '\u0000$&\u0000').replace(this.tokenisingRegex, '\u0000$&\u0000').split('\u0000').filter(token => token !== '');
  }

  restore(source) {
    return source.replace(/>\/\\\/\/__</g, '\n').trimRight();
  }

}

function createTokeniser(tokenisingRegex) {
  return new Tokeniser(tokenisingRegex);
}

const newlineRegex$1 = /^>\/\\\/\/__<$/;
const tabRegex$1 = /^>T\/\\B<$/;

class LineFitter {
  constructor(options) {
    [this.margin, this.desiredWidth, this.tabWidth] = options;
    this.lineTokens = [this.margin];
    this.cursor = 0;
    this.lineBlock = false;
    console.debug('[Line]', '▸', this.cursor);
  }

  createTab() {
    const width = this.tabWidth - this.cursor % this.tabWidth || 4;
    this.cursor += width;
    console.debug('[TAB', width, ']', '▸', this.cursor);
    return ' '.repeat(width);
  }

  add(token) {
    if (newlineRegex$1.test(token)) {
      console.debug('[Newline]', '▸', this.cursor);
      return true;
    }

    if (ansiRegex().test(token)) {
      console.debug('[ANSI Token]', '▸', this.cursor);
      this.lineTokens.push(token);
      return false;
    }

    if (tabRegex$1.test(token)) {
      this.lineTokens.push(this.createTab());
      return false;
    }

    const overlap = this.cursor + token.trimRight().length - this.desiredWidth;

    switch (renderMode.selected) {
      case 'hard':
        if (overlap > 0) {
          const head = token.trimRight().substring(0, token.length - overlap);
          const tail = token.substring(token.length - overlap);
          this.lineTokens.push(head);
          this.cursor += head.length;
          console.debug('[Token][Head]', head, '▸', this.cursor);
          console.debug('[Token][Tail]', tail);
          return tail === ' ' ? '' : tail;
        }

        this.lineTokens.push(token);
        this.cursor += token.length;
        console.debug('[Token]', token, '▸', this.cursor);
        return false;

      case 'keep':
        this.lineTokens.push(token);
        this.cursor += token.length;
        console.debug('[Token]', token, '▸', this.cursor);
        return false;

      default:
        if (overlap > 0) {
          if (this.cursor > 0) {
            return token;
          }
        }

        this.lineTokens.push(token);
        this.cursor += token.length;
        console.debug('[Token]', token, '▸', this.cursor);
        return false;
    }
  }

  toString() {
    return this.lineTokens.join('');
  }

}

function createLineFitter(margin, width, tabWidth) {
  return new LineFitter([margin, width, tabWidth]);
}

class WrapTool {
  constructor({
    left,
    width,
    tabWidth,
    tokenRegex
  }) {
    this.margin = ' '.repeat(left);
    this.desiredWidth = width;
    this.tabWidth = tabWidth;
    this.tokeniser = createTokeniser(tokenRegex);
  }

  wrap(text) {
    this.lines = [];
    const tokens = this.tokeniser.process(text);
    let currentLine = createLineFitter(this.margin, this.desiredWidth, this.tabWidth);

    while (tokens.length) {
      const overflow = currentLine.add(tokens.shift());

      if (overflow) {
        this.lines.push(currentLine.toString());
        console.debug('Line complete:', currentLine.toString());
        currentLine = createLineFitter(this.margin, this.desiredWidth, this.tabWidth);

        if (overflow !== true && overflow !== false) {
          console.debug('╰ Overflow:', overflow);
          tokens.unshift(overflow);
        }
      }
    }

    this.lines.push(currentLine.toString());
    return this.lines.map(line => this.tokeniser.restore(line)).join('\n');
  }

}

function createWrapTool(options) {
  return new WrapTool(options);
}

const clr = _merge(trucolor.simple({
  format: 'sgr'
}), trucolor.palette({
  format: 'sgr'
}), {
  bright: 'bold rgb(255,255,255)',
  dark: '#333'
});
const colorReplacer = new commonTags.TemplateTag(commonTags.replaceSubstitutionTransformer(/([a-zA-Z]+?)[:/|](.+)/, (match, colorName, content) => `${clr[colorName]}${content}${clr[colorName].out}`));

const prefix = '\u001B]1337;File=inline=1;';
const suffix = '\u0007';
const broken = path.join(__dirname, '/../media/broken.png');

class Image {
  constructor({
    file,
    name,
    width = 'auto',
    height = 'auto'
  }) {
    const extName = path.extname(file);
    const fileName = name || path.basename(file, extName);
    const lineNameBase64 = Buffer.from(fileName).toString('base64');
    this.config = `width=${width};height=${height};name=${lineNameBase64}`;

    this.filePath = function () {
      try {
        if (fs.statSync(file).isFile()) {
          return file;
        }
      } catch (error) {
        switch (error.code) {
          case 'ENOENT':
            console.warn('Warning:', `${file} not found.`);
            break;

          default:
            console.error(error);
        }

        return broken;
      }
    }();
  }

  render(options) {
    const {
      align,
      stretch = false,
      nobreak
    } = options;
    const content = Buffer.from(fs.readFileSync(this.filePath));
    const aspect = stretch ? 'preserveAspectRatio=0;' : '';
    const linebreak = nobreak ? '' : '\n';
    const newline = align > 1 ? `\u001BH\u001B[${align}A` : linebreak;
    return `${prefix}${aspect}size=${content.length}${this.config}:${content.toString('base64')}${suffix}${newline}`;
  }

}

function createImage(source) {
  return new Image(source);
}

function panel(buffer_, delimiter_, width_) {
  let longIdx = 0;
  let maxCols = 0;
  const spacerCols = [];
  const tableData = [];

  _forEach(_split(buffer_.trim(), '\n'), (row, rowIdx) => {
    const columnData = {};

    _forEach(_split(row, delimiter_), (col, colIdx) => {
      if (col === ':space:') {
        spacerCols.push(colIdx);
        columnData[`spacer${colIdx}`] = ' ';
      } else if (spacerCols.includes(colIdx)) {
        columnData[`spacer${colIdx}`] = ' ';
      } else {
        columnData[`c${colIdx}`] = col;
      }

      if (colIdx > maxCols) {
        maxCols = colIdx;
        longIdx = rowIdx;
      }
    });

    tableData.push(columnData);
  });

  const setSpacer = (spacerSize, min) => _max([Math.floor((width_ - spacerCols.length * spacerSize) / (maxCols - spacerCols.length + 1)), min]) - 1;

  const configuration = {};
  const max = setSpacer(16, 5);
  const min = setSpacer(4, 3);
  Object.keys(tableData[longIdx]).forEach(idx => {
    if (idx.includes('spacer')) {
      configuration[idx] = {
        maxWidth: 16,
        minWidth: 4
      };
    } else {
      configuration[idx] = {
        maxWidth: _max([min, max]),
        minWidth: _min([min, max])
      };
    }
  });
  return {
    content: tableData,
    configuration
  };
}

const console = verbosity.createConsole({
  outStream: process.stderr
});
const locale = osLocale.sync();
const metadata = meta(__dirname);
const renderMode = nSelector.createSelector(['soft', 'hard', 'keep', 'container'], 0, 'configuration_mode');

function unimplemented() {
  throw new Error('Unimplemented.');
}

function truwrap({
  left = 2,
  right = 2,
  width,
  mode = 'soft',
  tabWidth = 4,
  outStream = process.stdout,
  tokenRegex
}) {
  const ttyActive = Boolean(width || outStream.isTTY || /keep|container/.test(mode));

  const ttyWidth = function () {
    if (width) {
      return width;
    }

    if (outStream.isTTY) {
      return outStream.columns || outStream.getWindowSize()[0];
    }

    return Infinity;
  }();

  const viewWidth = function () {
    if (ttyWidth - left - right > 1) {
      return ttyWidth - left - right;
    }

    return 2;
  }();

  renderMode.select(mode);

  const viewHandler = function () {
    if (ttyActive && mode !== 'container') {
      return createWrapTool({
        left,
        width: viewWidth,
        tabWidth,
        tokenRegex
      });
    }

    return {};
  }();

  const api = {
    end() {
      if (outStream._isStdio) {
        outStream.write('\n');
      } else {
        outStream.end();
      }
    },

    getWidth: unimplemented,

    panel(content, configuration) {
      if (outStream._isStdio) {
        outStream.write(columnify(content, configuration));
      }

      return this;
    },

    break(newlines = 1) {
      outStream.write('\n'.repeat(newlines));
      return this;
    },

    clear() {
      outStream.write('\n');
      return this;
    },

    write(text) {
      outStream.write(text);
      return this;
    }

  };

  switch (true) {
    case !ttyActive:
      console.info(colorReplacer`${'yellow|Non-TTY'}: width: Infinity`);
      return Object.assign(Object.create(api), {
        getWidth: () => ttyWidth
      });

    case renderMode.selected === 'container':
      console.info(`Container: width: ${width}, render mode: ${renderMode.selected}`);
      return Object.assign(Object.create(api), {
        getWidth: () => ttyWidth
      });

    default:
      console.info(commonTags.stripIndent(colorReplacer)`
				${'green|Renderer'}:
				  mode ▸ ${renderMode.selected} [${locale}]
				  ┆ ${left} ◂├╌╌╌╌ ${viewWidth} ╌╌╌╌┤▸ ${right} ┆
			`, '\n');
      return Object.assign(Object.create(api), {
        getWidth: () => viewWidth,

        panel(content, configuration) {
          outStream.write(viewHandler.wrap(columnify(content, configuration)));
          return this;
        },

        write(text) {
          outStream.write(viewHandler.wrap(text));
          return this;
        }

      });
  }
}

exports.console = console;
exports.createImage = createImage;
exports.locale = locale;
exports.metadata = metadata;
exports.parsePanel = panel;
exports.renderMode = renderMode;
exports.truwrap = truwrap;
