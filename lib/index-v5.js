'use strict'

Object.defineProperty(exports, '__esModule', {
	value: true
})

function _interopDefault(ex) {
	return (ex && (typeof ex === 'object') && 'default' in ex) ? ex.default : ex
}

const path = require('path')
const readPkg = _interopDefault(require('read-pkg'))
const columnify = _interopDefault(require('columnify'))
const osLocale = _interopDefault(require('os-locale'))
const verbosity = require('verbosity')
const commonTags = require('common-tags')
const meta = _interopDefault(require('@thebespokepixel/meta'))
const _thebespokepixel_nSelector = require('@thebespokepixel/n-selector')
const ansiRegex = _interopDefault(require('ansi-regex'))
const trucolor = _interopDefault(require('trucolor'))
const deepAssign = _interopDefault(require('deep-assign'))
const fs = require('fs')
const semver = require('semver')
const _min = _interopDefault(require('lodash/min'))
const _max = _interopDefault(require('lodash/max'))
const _split = _interopDefault(require('lodash/split'))
const _forEach = _interopDefault(require('lodash/forEach'))

const tabRegex = /\t/g
const newlineRegex = /\n/g

class Tokeniser {
	constructor(tokenisingRegex) {
		this.tokenisingRegex = tokenisingRegex || (function () {
			switch (renderMode.selected) {
				case 'keep':
					return (/^.*$/mg
					)
				default:
					return (/\S+\s+/g
					)
			}
		})()
	}

	process(source) {
		return source.replace(newlineRegex, '\u0000>/\\//__<\u0000').replace(tabRegex, '\u0000>T/\\B<\u0000').replace(ansiRegex(), '\u0000$&\u0000').replace(this.tokenisingRegex, '\u0000$&\u0000').split('\u0000').filter(token => token !== '')
	}

	restore(source) {
		return source.replace(/>\/\\\/\/__</g, '\n').trimRight()
	}
}

const createTokeniser = (tokenisingRegex => new Tokeniser(tokenisingRegex))

const asyncGenerator = (function () {
	function AwaitValue(value) {
		this.value = value
	}

	function AsyncGenerator(gen) {
		let front
		let back

		function send(key, arg) {
			return new Promise((resolve$$1, reject) => {
				const request = {
					key,
					arg,
					resolve: resolve$$1,
					reject,
					next: null
				}

				if (back) {
					back = back.next = request
				} else {
					front = back = request
					resume(key, arg)
				}
			})
		}

		function resume(key, arg) {
			try {
				const result = gen[key](arg)
				const value = result.value

				if (value instanceof AwaitValue) {
					Promise.resolve(value.value).then(arg => {
						resume('next', arg)
					}, arg => {
						resume('throw', arg)
					})
				} else {
					settle(result.done ? 'return' : 'normal', result.value)
				}
			} catch (err) {
				settle('throw', err)
			}
		}

		function settle(type, value) {
			switch (type) {
				case 'return':
					front.resolve({
						value,
						done: true
					})
					break

				case 'throw':
					front.reject(value)
					break

				default:
					front.resolve({
						value,
						done: false
					})
					break
			}

			front = front.next

			if (front) {
				resume(front.key, front.arg)
			} else {
				back = null
			}
		}

		this._invoke = send

		if (typeof gen.return !== 'function') {
			this.return = undefined
		}
	}

	if (typeof Symbol === 'function' && Symbol.asyncIterator) {
		AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
			return this
		}
	}

	AsyncGenerator.prototype.next = function (arg) {
		return this._invoke('next', arg)
	}

	AsyncGenerator.prototype.throw = function (arg) {
		return this._invoke('throw', arg)
	}

	AsyncGenerator.prototype.return = function (arg) {
		return this._invoke('return', arg)
	}

	return {
		wrap(fn) {
			return function () {
				return new AsyncGenerator(fn.apply(this, arguments))
			}
		},
		await(value) {
			return new AwaitValue(value)
		}
	}
})()

const get$1 = function get$1(object, property, receiver) {
	if (object === null)
		{object = Function.prototype}
	const desc = Object.getOwnPropertyDescriptor(object, property)

	if (desc === undefined) {
		const parent = Object.getPrototypeOf(object)

		if (parent === null) {
			return undefined
		} else {
			return get$1(parent, property, receiver)
		}
	} else if ('value' in desc) {
		return desc.value
	} else {
		const getter = desc.get

		if (getter === undefined) {
			return undefined
		}

		return getter.call(receiver)
	}
}

const set = function set(object, property, value, receiver) {
	const desc = Object.getOwnPropertyDescriptor(object, property)

	if (desc === undefined) {
		const parent = Object.getPrototypeOf(object)

		if (parent !== null) {
			set(parent, property, value, receiver)
		}
	} else if ('value' in desc && desc.writable) {
		desc.value = value
	} else {
		const setter = desc.set

		if (setter !== undefined) {
			setter.call(receiver, value)
		}
	}

	return value
}

const slicedToArray = (function () {
	function sliceIterator(arr, i) {
		const _arr = []
		let _n = true
		let _d = false
		let _e

		try {
			for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
				_arr.push(_s.value)

				if (i && _arr.length === i) {break}
			}
		} catch (err) {
			_d = true
			_e = err
		} finally {
			try {
				if (!_n && _i.return) {_i.return()}
			} finally {
				if (_d)
					{throw _e}
			}
		}

		return _arr
	}

	return function (arr, i) {
		if (Array.isArray(arr)) {
			return arr
		} else if (Symbol.iterator in Object(arr)) {
			return sliceIterator(arr, i)
		} else {
			throw new TypeError('Invalid attempt to destructure non-iterable instance')
		}
	}
})()

const newlineRegex$1 = /^>\/\\\/\/__<$/
const tabRegex$1 = /^>T\/\\B<$/

class LineFitter {
	constructor(options) {
		const _options = slicedToArray(options, 3)

		this.margin = _options[0]
		this.desiredWidth = _options[1]
		this.tabWidth = _options[2]

		this.lineTokens = [this.margin]
		this.cursor = 0
		this.lineBlock = false
		console.debug('[Line]', '▸', this.cursor)
	}

	createTab() {
		const width = this.tabWidth - this.cursor % this.tabWidth || 4
		this.cursor += width
		console.debug('[TAB', width, ']', '▸', this.cursor)
		return ' '.repeat(width)
	}

	add(token) {
		if (newlineRegex$1.test(token)) {
			console.debug('[Newline]', '▸', this.cursor)
			return true
		}

		if (ansiRegex().test(token)) {
			console.debug('[ANSI Token]', '▸', this.cursor)
			this.lineTokens.push(token)
			return false
		}

		if (tabRegex$1.test(token)) {
			this.lineTokens.push(this.createTab())
			return false
		}

		const overlap = this.cursor + token.trimRight().length - this.desiredWidth

		switch (renderMode.selected) {
			case 'hard':
				if (overlap > 0) {
					const head = token.trimRight().substring(0, token.length - overlap)
					const tail = token.substring(token.length - overlap)
					this.lineTokens.push(head)
					this.cursor += head.length
					console.debug('[Token][Head]', head, '▸', this.cursor)
					console.debug('[Token][Tail]', tail)
					return tail === ' ' ? '' : tail
				}

				this.lineTokens.push(token)
				this.cursor += token.length
				console.debug('[Token]', token, '▸', this.cursor)
				return false

			case 'keep':
				this.lineTokens.push(token)
				this.cursor += token.length
				console.debug('[Token]', token, '▸', this.cursor)
				return false

			default:
				if (overlap > 0) {
					if (this.cursor > 0) {
						return token
					}
				}

				this.lineTokens.push(token)
				this.cursor += token.length
				console.debug('[Token]', token, '▸', this.cursor)
				return false
		}
	}

	toString() {
		return this.lineTokens.join('')
	}
}

const createLineFitter = ((margin, width, tabWidth) => new LineFitter([margin, width, tabWidth]))

class WrapTool {
	constructor(_ref) {
		const left = _ref.left
		const width = _ref.width
		const tabWidth = _ref.tabWidth
		const tokenRegex = _ref.tokenRegex

		this.margin = ' '.repeat(left)
		this.desiredWidth = width
		this.tabWidth = tabWidth
		this.tokeniser = createTokeniser(tokenRegex)
	}

	wrap(text) {
		this.lines = []
		const tokens = this.tokeniser.process(text)

		let currentLine = createLineFitter(this.margin, this.desiredWidth, this.tabWidth)

		while (tokens.length) {
			const overflow = currentLine.add(tokens.shift())
			if (overflow) {
				this.lines.push(currentLine.toString())
				console.debug('Line complete:', currentLine.toString())
				currentLine = createLineFitter(this.margin, this.desiredWidth, this.tabWidth)
				if (overflow !== true && overflow !== false) {
					console.debug('╰ Overflow:', overflow)
					tokens.unshift(overflow)
				}
			}
		}
		this.lines.push(currentLine.toString())
		return this.lines.map(this.tokeniser.restore).join('\n')
	}
}

const createWrapTool = (options => new WrapTool(options))

const clr = deepAssign(trucolor.simplePalette(), trucolor.bulk({}, {
	bright: 'bold rgb(255,255,255)',
	dark: '#333'
}))

const colorReplacer = new commonTags.TemplateTag(commonTags.replaceSubstitutionTransformer(/([a-zA-Z]+?)[:/|](.+)/, (match, colorName, content) => `${clr[colorName]}${content}${clr[colorName].out}`))

const prefix = '\x1b]1337;File=inline=1;'
const suffix = '\x07'

const broken = `${__dirname}/../media/broken.png`

class Image {
	constructor(_ref) {
		const file = _ref.file
		const name = _ref.name
		const _ref$width = _ref.width
		const width = _ref$width === undefined ? 'auto' : _ref$width
		const _ref$height = _ref.height
		const height = _ref$height === undefined ? 'auto' : _ref$height

		const extName = path.extname(file)
		const fileName = name || path.basename(file, extName)

		const lineNameBase64 = (semver.gte(process.version, '6.0.0') ? Buffer.from(fileName) : new Buffer(fileName)).toString('base64')

		this.config = `width=${width};height=${height};name=${lineNameBase64}`

		this.filePath = (function () {
			try {
				if (fs.statSync(file).isFile()) {
					return file
				}
			} catch (err) {
				switch (err.code) {
					case 'ENOENT':
						console.warn('Warning:', `${file} not found.`)
						break
					default:
						console.error(err)
				}
				return broken
			}
		})()
	}

	render(options) {
		const align = options.align
		const _options$stretch = options.stretch
		const stretch = _options$stretch === undefined ? false : _options$stretch
		const nobreak = options.nobreak

		const content = semver.gte(process.version, '6.0.0') ? Buffer.from(fs.readFileSync(this.filePath)) : new Buffer(fs.readFileSync(this.filePath))

		const aspect = stretch ? 'preserveAspectRatio=0;' : ''
		const linebreak = nobreak ? '' : '\n'
		const newline = align > 1 ? `H[${align}A` : linebreak

		return `${prefix}${aspect}size=${content.length}${this.config}:${content.toString('base64')}${suffix}${newline}`
	}
}

const image = (source => new Image(source))

function createCommonjsModule(fn, module) {
	return module = {
		exports: {}
	}, fn(module, module.exports), module.exports
}

const _global = createCommonjsModule(module => {
	const global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')()
	if (typeof __g == 'number')
		{__g = global}
})

const _core = createCommonjsModule(module => {
	const core = module.exports = {
		version: '2.4.0'
	}
	if (typeof __e == 'number')
		{__e = core}
})

const _isObject = function _isObject(it) {
	return typeof it === 'object' ? it !== null : typeof it === 'function'
}

const isObject = _isObject
const _anObject = function _anObject(it) {
	if (!isObject(it))
		{throw TypeError(it + ' is not an object!')}
	return it
}

const _fails = function _fails(exec) {
	try {
		return Boolean(exec())
	} catch (e) {
		return true
	}
}

const _descriptors = !_fails(() => {
	return Object.defineProperty({}, 'a', {
		get: function get() {
			return 7
		}
	}).a != 7
})

const isObject$1 = _isObject
const document = _global.document
const is = isObject$1(document) && isObject$1(document.createElement)
const _domCreate = function _domCreate(it) {
	return is ? document.createElement(it) : {}
}

const _ie8DomDefine = !_descriptors && !_fails(() => {
	return Object.defineProperty(_domCreate('div'), 'a', {
		get: function get() {
			return 7
		}
	}).a != 7
})

const isObject$2 = _isObject

const _toPrimitive = function _toPrimitive(it, S) {
	if (!isObject$2(it)) {return it}
	let fn
	let val
	if (S && typeof (fn = it.toString) == 'function' && !isObject$2(val = fn.call(it))) {return val}
	if (typeof (fn = it.valueOf) == 'function' && !isObject$2(val = fn.call(it))) {return val}
	if (!S && typeof (fn = it.toString) == 'function' && !isObject$2(val = fn.call(it))) {return val}
	throw TypeError('Can\'t convert object to primitive value')
}

const anObject = _anObject
const IE8_DOM_DEFINE = _ie8DomDefine
const toPrimitive = _toPrimitive
const dP$1 = Object.defineProperty

const f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	anObject(O)
	P = toPrimitive(P, true)
	anObject(Attributes)
	if (IE8_DOM_DEFINE) {try {
		return dP$1(O, P, Attributes)
	} catch (e) {}}
	if ('get' in Attributes || 'set' in Attributes)
		{throw TypeError('Accessors not supported!')}
	if ('value' in Attributes)
		{O[P] = Attributes.value}
	return O
}

const _objectDp = {
	f
}

const _propertyDesc = function _propertyDesc(bitmap, value) {
	return {
		enumerable: !(bitmap & 1),
		configurable: !(bitmap & 2),
		writable: !(bitmap & 4),
		value
	}
}

const dP = _objectDp
const createDesc = _propertyDesc
const _hide = _descriptors ? function (object, key, value) {
	return dP.f(object, key, createDesc(1, value))
} : function (object, key, value) {
	object[key] = value
	return object
}

const hasOwnProperty = {}.hasOwnProperty
const _has = function _has(it, key) {
	return hasOwnProperty.call(it, key)
}

let id = 0
const px = Math.random()
const _uid = function _uid(key) {
	return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36))
}

const _redefine = createCommonjsModule(module => {
	const global = _global
	const hide = _hide
	const has = _has
	const SRC = _uid('src')
	const TO_STRING = 'toString'
	const $toString = Function[TO_STRING]
	const TPL = (String($toString)).split(TO_STRING)

	_core.inspectSource = function (it) {
		return $toString.call(it)
	};

	(module.exports = function (O, key, val, safe) {
		const isFunction = typeof val == 'function'
		if (isFunction) {has(val, 'name') || hide(val, 'name', key)}
		if (O[key] === val) {return}
		if (isFunction) {has(val, SRC) || hide(val, SRC, O[key] ? String(O[key]) : TPL.join(String(key)))}
		if (O === global) {
			O[key] = val
		} else if (!safe) {
			delete O[key]
			hide(O, key, val)
		} else if (O[key])
			{O[key] = val} else {hide(O, key, val)}
	})(Function.prototype, TO_STRING, function toString() {
		return typeof this == 'function' && this[SRC] || $toString.call(this)
	})
})

const _aFunction = function _aFunction(it) {
	if (typeof it != 'function')
		{throw TypeError(it + ' is not a function!')}
	return it
}

const aFunction = _aFunction
const _ctx = function _ctx(fn, that, length) {
	aFunction(fn)
	if (that === undefined) {return fn}
	switch (length) {
		case 1:
			return function (a) {
				return fn.call(that, a)
			}
		case 2:
			return function (a, b) {
				return fn.call(that, a, b)
			}
		case 3:
			return function (a, b, c) {
				return fn.call(that, a, b, c)
			}
	}
	return function () {
		return fn.apply(that, arguments)
	}
}

const global$1 = _global
const core = _core
const hide = _hide
const redefine = _redefine
const ctx = _ctx
const PROTOTYPE = 'prototype'

const $export$1 = function $export$1(type, name, source) {
	const IS_FORCED = type & $export$1.F
	const IS_GLOBAL = type & $export$1.G
	const IS_STATIC = type & $export$1.S
	const IS_PROTO = type & $export$1.P
	const IS_BIND = type & $export$1.B
	const target = IS_GLOBAL ? global$1 : IS_STATIC ? global$1[name] || (global$1[name] = {}) : (global$1[name] || {})[PROTOTYPE]
	const exports = IS_GLOBAL ? core : core[name] || (core[name] = {})
	const expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
	let key
	let own
	let out
	let exp
	if (IS_GLOBAL)
		{source = name}
	for (key in source) {
		own = !IS_FORCED && target && target[key] !== undefined

		out = (own ? target : source)[key]

		exp = IS_BIND && own ? ctx(out, global$1) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out

		if (target) {redefine(target, key, out, type & $export$1.U)}

		if (exports[key] != out) {hide(exports, key, exp)}
		if (IS_PROTO && expProto[key] != out)
			{expProto[key] = out}
	}
}
global$1.core = core

$export$1.F = 1
$export$1.G = 2
$export$1.S = 4
$export$1.P = 8
$export$1.B = 16
$export$1.W = 32
$export$1.U = 64
$export$1.R = 128
const _export = $export$1

const toString$1 = {}.toString

const _cof = function _cof(it) {
	return toString$1.call(it).slice(8, -1)
}

const cof = _cof
const _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	return cof(it) == 'String' ? it.split('') : Object(it)
}

const _defined = function _defined(it) {
	if (it == undefined)
		{throw TypeError('Can\'t call method on  ' + it)}
	return it
}

const IObject = _iobject
const defined = _defined
const _toIobject = function _toIobject(it) {
	return IObject(defined(it))
}

const ceil = Math.ceil
const floor = Math.floor
const _toInteger = function _toInteger(it) {
	return isNaN(it = Number(it)) ? 0 : (it > 0 ? floor : ceil)(it)
}

const toInteger = _toInteger
const min = Math.min
const _toLength = function _toLength(it) {
	return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0
}

const toInteger$1 = _toInteger
const max = Math.max
const min$1 = Math.min
const _toIndex = function _toIndex(index, length) {
	index = toInteger$1(index)
	return index < 0 ? max(index + length, 0) : min$1(index, length)
}

const toIObject = _toIobject
const toLength = _toLength
const toIndex = _toIndex
const _arrayIncludes = function _arrayIncludes(IS_INCLUDES) {
	return function ($this, el, fromIndex) {
		const O = toIObject($this)
		const length = toLength(O.length)
		let index = toIndex(fromIndex, length)
		let value

		if (IS_INCLUDES && el != el)
			{while (length > index) {
				value = O[index++]
				if (value != value) {return true}
			}}
		else
			{for (; length > index; index++)
				{if (IS_INCLUDES || index in O) {
					if (O[index] === el) {return IS_INCLUDES || index || 0}
				}}}
		return !IS_INCLUDES && -1
	}
}

const global$2 = _global
const SHARED = '__core-js_shared__'
const store = global$2[SHARED] || (global$2[SHARED] = {})
const _shared = function _shared(key) {
	return store[key] || (store[key] = {})
}

const _wks = createCommonjsModule(module => {
	const store = _shared('wks')
	const uid = _uid
	const Symbol = _global.Symbol
	const USE_SYMBOL = typeof Symbol == 'function'

	const $exports = module.exports = function (name) {
		return store[name] || (store[name] = USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name))
	}

	$exports.store = store
})

const UNSCOPABLES = _wks('unscopables')
const ArrayProto = Array.prototype
if (ArrayProto[UNSCOPABLES] == undefined) {_hide(ArrayProto, UNSCOPABLES, {})}
const _addToUnscopables = function _addToUnscopables(key) {
	ArrayProto[UNSCOPABLES][key] = true
}

const $export = _export
const $includes = _arrayIncludes(true)

$export($export.P, 'Array', {
	includes: function includes(el) {
		return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined)
	}
})

_addToUnscopables('includes')

const panel = function (buffer_, delimiter_, width_) {
	let longIdx = 0
	let maxCols = 0
	const spacerCols = []
	const tableData = []

	_forEach(_split(buffer_.trim(), '\n'), (row, rowIdx) => {
		const columnData = {}

		_forEach(_split(row, delimiter_), (col, colIdx) => {
			if (col === ':space:') {
				spacerCols.push(colIdx)
				columnData[`spacer${colIdx}`] = ' '
			} else if (spacerCols.includes(colIdx)) {
				columnData[`spacer${colIdx}`] = ' '
			} else {
				columnData[`c${colIdx}`] = col
			}
			if (colIdx > maxCols) {
				maxCols = colIdx
				longIdx = rowIdx
			}
		})

		tableData.push(columnData)
	})

	const configuration = {}
	const max = _max([Math.floor((width_ - spacerCols.length * 16) / (maxCols - spacerCols.length + 1)), 5]) - 1
	const min = _max([Math.floor((width_ - spacerCols.length * 4) / (maxCols - spacerCols.length + 1)), 3]) - 1

	Object.keys(tableData[longIdx]).forEach(idx => {
		if (idx.includes('spacer')) {
			configuration[idx] = {
				maxWidth: 16,
				minWidth: 4
			}
		} else {
			configuration[idx] = {
				maxWidth: _max([min, max]),
				minWidth: _min([min, max])
			}
		}
	})

	return {
		content: tableData,
		configuration
	}
}

const console = verbosity.createConsole({
	outStream: process.stderr
})
const pkg = readPkg.sync(path.resolve(__dirname, '..'))
const locale = osLocale.sync()
const metadata = meta(__dirname)
const renderMode = _thebespokepixel_nSelector.createSelector(['soft', 'hard', 'keep', 'container'], 0, 'configuration_mode')

function unimplemented() {
	throw new Error('Unimplemented.')
}

function truwrap(_ref) {
	const _ref$left = _ref.left
	const left = _ref$left === undefined ? 2 : _ref$left
	const _ref$right = _ref.right
	const right = _ref$right === undefined ? 2 : _ref$right
	const width = _ref.width
	const _ref$mode = _ref.mode
	const mode = _ref$mode === undefined ? 'soft' : _ref$mode
	const _ref$tabWidth = _ref.tabWidth
	const tabWidth = _ref$tabWidth === undefined ? 4 : _ref$tabWidth
	const _ref$outStream = _ref.outStream
	const outStream = _ref$outStream === undefined ? process.stdout : _ref$outStream
	const tokenRegex = _ref.tokenRegex

	const ttyActive = Boolean(width || outStream.isTTY || /keep|container/.test(mode))

	const ttyWidth = (function () {
		if (width) {
			return width
		} else if (outStream.isTTY) {
			return outStream.columns || outStream.getWindowSize()[0]
		}
		return Infinity
	})()

	const viewWidth = (function () {
		if (ttyWidth - left - right > 1) {
			return ttyWidth - left - right
		}
		return 2
	})()

	renderMode.select(mode)

	const viewHandler = (function () {
		if (ttyActive && mode !== 'container') {
			return createWrapTool({
				left,
				width: viewWidth,
				tabWidth,
				tokenRegex
			})
		}
		return {}
	})()

	const api = {
		end() {
			if (outStream._isStdio) {
				outStream.write('\n')
			} else {
				outStream.end()
			}
		},

		getWidth: unimplemented,

		panel(content, configuration) {
			if (outStream._isStdio) {
				outStream.write(columnify(content, configuration))
			}
		},

		break: unimplemented,

		clear: unimplemented,

		write: unimplemented
	}

	switch (true) {
		case !ttyActive:
			console.info(colorReplacer`${'yellow|Non-TTY'}: width: Infinity`)

			return Object.assign(Object.create(api), {
				getWidth: () => ttyWidth,
				break() {
					const newlines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1

					outStream.write('\n'.repeat(newlines))
					return this
				},
				clear() {
					outStream.write('\n')
					return this
				},
				write(text) {
					outStream.write(text)
					return this
				}
			})

		case renderMode.selected === 'container':
			console.info(`Container: width: ${width}, render mode: ${renderMode.selected}`)

			return Object.assign(Object.create(api), {
				getWidth: () => ttyWidth,
				break() {
					const newlines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1

					outStream.write('\n'.repeat(newlines))
					return this
				},
				clear() {
					outStream.write('\n')
					return this
				},
				write(text) {
					outStream.write(text)
					return this
				}
			})

		default:
			console.info(commonTags.stripIndent(colorReplacer)`
				${'green|Renderer'}:
				  mode ▸ ${renderMode.selected} [${locale}]
				  ┆ ${left} ◂├╌╌╌╌ ${viewWidth} ╌╌╌╌┤▸ ${right} ┆
			`, '\n')

			return Object.assign(Object.create(api), {
				getWidth: () => viewWidth,
				break() {
					const newlines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1

					outStream.write('\n'.repeat(newlines))
					return this
				},
				panel(content, configuration) {
					outStream.write(viewHandler.wrap(columnify(content, configuration)))
					return this
				},
				clear() {
					outStream.write('\n')
					return this
				},
				write(text) {
					outStream.write(viewHandler.wrap(text))
					return this
				}
			})
	}
}

exports.console = console
exports.pkg = pkg
exports.locale = locale
exports.metadata = metadata
exports.renderMode = renderMode
exports.truwrap = truwrap
exports.createImage = image
exports.parsePanel = panel

