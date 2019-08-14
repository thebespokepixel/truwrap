# truwrap

> A node module and CLI for text wrapping, panels & tables that supports 24bit color SGR codes.

##### Publishing Status

[![npm](https://img.shields.io/npm/v/truwrap?logo=npm)](https://www.npmjs.com/package/truwrap "npm") [![David](https://david-dm.org/thebespokepixel/truwrap/master/status.svg)](https://david-dm.org/thebespokepixel/truwrap/master "David")  
 [![Travis](https://img.shields.io/travis/com/thebespokepixel/truwrap/master?logo=travis)](https://travis-ci.com/thebespokepixel/truwrap "Travis") [![Rollup](https://img.shields.io/badge/es6-module%3Amjs_%E2%9C%94-64CA39?&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDE0IDE0Ij4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPHBhdGggZmlsbD0iI0ZGMzMzMyIgZD0iTTEwLjkwNDI4MjQsMy4wMDkxMDY4MyBDMTEuMjM4NzA1NSwzLjU4MjgzNzEzIDExLjQyODU3MTQsNC4yNDQ4MzM2MyAxMS40Mjg1NzE0LDQuOTUwOTYzMjIgQzExLjQyODU3MTQsNi40MTc4NjM0IDEwLjYwODY5NTcsNy42OTU2MjE3MiA5LjM5MTgyNzM5LDguMzc2NTMyNCBDOS4zMDU1MjQ2OCw4LjQyNDg2ODY1IDkuMjczMTYxMTYsOC41MzIwNDkwNCA5LjMxODQ3MDA5LDguNjE4MjEzNjYgTDExLjQyODU3MTQsMTMgTDUuMjU4NjgyODEsMTMgTDIuMzM5Nzc3MjMsMTMgQzIuMTUyMTIzNDUsMTMgMiwxMi44NDgyNzU3IDIsMTIuNjUzODA0OCBMMiwxLjM0NjE5NTIyIEMyLDEuMTU0OTk2ODggMi4xNDgzMTU0MywxIDIuMzM5Nzc3MjMsMSBMNy42NjAyMjI3NywxIEM3LjcwMTU0MTQ5LDEgNy43NDExMzc2NCwxLjAwNzM1NTg4IDcuNzc3NzY2NTgsMS4wMjA5MDQyOSBDOS4wNjQ1MzgyOCwxLjE0NDU0MDA0IDEwLjE3MzM4ODQsMS44NTM4NTI5MSAxMC44MjIyOTQ5LDIuODcyNTA0MzggQzEwLjc5OTE5NTMsMi44NDQ4NDgwNiAxMC44NDQ0OTkxLDIuOTQ5MTc0NzYgMTAuOTA0MjgyNCwzLjAwOTEwNjgzIFoiLz4KICAgIDxwYXRoIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iLjMxIiBkPSJNOC44NTcxNDI4NiwzLjU3MTQyODU3IEw2LjcxNDI4NTcxLDYuNTcxNDI4NTcgTDkuMjg1NzE0MjksNS4yODU3MTQyOSBDOS4yODU3MTQyOSw1LjI4NTcxNDI5IDkuNzE0Mjg1NzEsNC44NTcxNDI4NiA5LjI4NTcxNDI5LDQuNDI4NTcxNDMgQzkuMjg1NzE0MjksNCA4Ljg1NzE0Mjg2LDMuNTcxNDI4NTcgOC44NTcxNDI4NiwzLjU3MTQyODU3IFoiLz4KICAgIDxwYXRoIGZpbGw9IiNGQkIwNDAiIGQ9Ik0yLjg0Njc0NjAzLDEyLjk5NTg0OTUgQzMuMjY0OTIwNjIsMTIuOTk1ODQ5NSAzLjE4NTkzMDM0LDEyLjk0NjM2NjkgMy4zMTYxMTYzOCwxMi44NzM5MDU0IEMzLjYxODE3NTg3LDEyLjcwNTc3OTMgNS42ODk0NDA5OSw4LjcxMjc4NDU5IDcuNzE3NTU0NzYsNi44MjEzNjYwMiBDOS43NDU2Njg1Miw0LjkyOTk0NzQ2IDEwLjAwNDU3NjcsNS41NjA0MjAzMiA4Ljg4NDc5ODk1LDMuNTAyOTc3MjMgQzguODg0Nzk4OTUsMy41MDI5NzcyMyA5Ljc0NzgyNjA5LDUuMTQyMjA2NjUgOS4wMTQyNTMwMiw1LjI2ODMwMTIzIEM4LjQzODE4MjQxLDUuMzY3MDc1MzEgNy4xMTk5MDg0Nyw0LjEyMjk0MjIxIDcuNjExODMzOTMsMy4wMDQ5MDM2OCBDOC4wOTA4MTM5OSwxLjkxNDE4NTY0IDEwLjAxOTY3OTYsMi4xMjAxNDAxMSAxMC45MDY0NCwzLjAwOTEwNjgzIEMxMC44NzgzOTE2LDIuOTYyODcyMTUgMTAuODUwMzQzMiwyLjkxNjYzNzQ4IDEwLjgyMjI5NDksMi44NzI1MDQzOCBDMTAuMzA0NDc4NiwyLjI1MjUzOTQgOS41MDQwMjA5MiwxLjkwMzY3Nzc2IDguNzEwMDM1OTYsMS45MDM2Nzc3NiBDNy4xOTk3Mzg0OCwxLjkwMzY3Nzc2IDYuODIwMDA2NTQsMi40MjY5NzAyMyAzLjkyMDIzNTM3LDcuNjE5OTY0OTcgQzIuMzg3Nzk5MzQsMTAuMzY1NDA2NyAyLjAxMDgzMTkzLDExLjU3MzUwNzkgMi4wMDYyOTA2OSwxMi4xNjk4MTgyIEMyLDEyLjk5NTg0OTUgMi4wMDYyOTA2OSwxMi45OTU4NDk1IDIuODQ2NzQ2MDMsMTIuOTk1ODQ5NSBaIi8%2BCiAgPC9nPgo8L3N2Zz4K)](https://github.com/rollup/rollup/wiki/pkg.module "Rollup")   

##### Development Status

[![Greenkeeper](https://badges.greenkeeper.io/thebespokepixel/truwrap.svg)](https://greenkeeper.io/ "Greenkeeper") [![Travis](https://img.shields.io/travis/com/thebespokepixel/truwrap/develop?logo=travis)](https://travis-ci.com/thebespokepixel/truwrap "Travis")  
 [![David](https://david-dm.org/thebespokepixel/truwrap/develop/status.svg)](https://david-dm.org/thebespokepixel/truwrap/develop "David") [![David-developer](https://david-dm.org/thebespokepixel/truwrap/develop/dev-status.svg)](https://david-dm.org/thebespokepixel/truwrap/develop?type=dev "David-developer")  
 [![Snyk](https://snyk.io/test/github/thebespokepixel/truwrap/badge.svg)](https://snyk.io/test/github/thebespokepixel/truwrap "Snyk") [![Code-climate](https://api.codeclimate.com/v1/badges/5732d1aad01d74b6ef4a/maintainability)](https://codeclimate.com/github/thebespokepixel/truwrap/maintainability "Code-climate") [![Coverage](https://api.codeclimate.com/v1/badges/5732d1aad01d74b6ef4a/test_coverage)](https://codeclimate.com/github/thebespokepixel/truwrap/test_coverage "Coverage")   

##### Documentation/Help

[![Inch](https://inch-ci.org/github/thebespokepixel/truwrap.svg?branch=master&style=shields)](https://inch-ci.org/github/thebespokepixel/truwrap "Inch") [![Twitter](https://img.shields.io/twitter/follow/thebespokepixel?style=social)](https://twitter.com/thebespokepixel "Twitter")   

Many current tty text wrapping solutions have issues with the 'long' and currently 'non-standard' RGB SGR codes (i.e `^[[38;2;204;51;66m`). This meant that, while it's possible to have wonderful, rich, full gamut colours and the aesthetic data visualisations it entails, it comes at the price of painful typography and corrupted console displays as text is broken up, unnaturally wrapped and becoming unreadable as the SGR codes are dashed against the rocks of 1980's shortsightedness, confusing your terminal and ever so slightly breaking the heart of design aware coders and administrators everywhere.

_Clearly this is unnacceptable!_

Previously, the only solution was to take a last, long whistful look at how great console colour could be, before going back to the, at best, 256 colours of the xterm pallette, with it's lack of useful greens and overly dark purples, or, for some, the even more cruelly devastating 16 colours of the ansi pallette, before heading to the stationary cupboard for a bit of a cry.

But weep no more!

Developed as part of our internal data visualisation system, where having the fidelity of 24 bit colour and embedded images (currently OS X iTerm 3 only) was a huge advantage.

Usable within your own node.js cli projects and an npm module or directly from the command line as a shell scripting command.

![Screengrab][grab]


## Usage

#### Installation

```shell
npm install --save @thebespokepixel/truwrap
```

#### CLI

```text
  truwrap
  Smarter terminal text wrapping (handles 24bit color)

  Synopsis:
    cat inputFile | truwrap [options]

  Options:
    -h, --help       Display this help.
    -v, --version    Return the current version on stdout. -vv Return name & version.
    -V, --verbose    Be verbose. -VV Be loquacious.
    -o, --stderr     Use stderr rather than stdout
    -l, --left       Left margin
    -r, --right      Right margin
    -w, --width      Set total width. Overrides terminal window’s width.
    -t, --truncate   Truncate panel cells.
    -m, --mode       Wrapping mode
    -s, --stamp      Print arguments rather than stdin. printf-style options supported.
    -p, --panel      Render a tabular panel into the available console width.
    -d, --delimiter  The column delimiter when reading data for a panel.
    -x, --regex      Character run selection regex.
    --color          Force color depth --color=256|16m. Disable with --no-color

  Usage:
  Reads unformatted text from stdin and typographically applies paragraph wrapping it for the currently active tty.
```

To use, simply pipe in a body of text to wrap according to the supplied options.

```shell
  cat readme.md | truwrap --left 6 --right 6 --mode soft
```

#### Programmatic usage

```js
var truwrap = require('truwrap')

var writer = truwrap({
  left: 2,
  right: 2,
  mode: 'soft',
  outStream: process.stderr
})

var contentWidth = writer.getWidth()

writer.write("Some text to write...", "...and some more.")
writer.write("A new paragraph, if not implicitly present.")
writer.end()
```

### Advanced use

To add. Containers, Tables, Panels and Images.

### Related

For advanced 24bit colour handling see [thebespokepixel/trucolor](https://github.com/thebespokepixel/trucolor) and [npm trucolor](https://www.npmjs.com/package/trucolor).


## Documentation

Full documentation can be found at [https://thebespokepixel.github.io/truwrap/][1]

[1]: https://thebespokepixel.github.io/truwrap/

[grab]: https://raw.githubusercontent.com/thebespokepixel/truwrap/master/media/truwrap.png
