# truwrap v0.1.16

![Project status](http://img.shields.io/badge/status-alpha-red.svg?style=flat) [![Build Status](http://img.shields.io/travis/MarkGriffiths/truwrap.svg?branch=master&style=flat)](https://travis-ci.org/MarkGriffiths/truwrap) [![Dependency Status](http://img.shields.io/david/MarkGriffiths/truwrap.svg?style=flat)](https://david-dm.org/MarkGriffiths/truwrap) [![devDependency Status](http://img.shields.io/david/dev/MarkGriffiths/truwrap.svg?style=flat)](https://david-dm.org/MarkGriffiths/truwrap#info=devDependencies) [![npm](https://img.shields.io/npm/v/truwrap.svg?style=flat)](https://www.npmjs.com/package/truwrap)

__Work in progress.__

Smarter text wrapping for modern xterms that support 24bit SGR color.

Many current tty text wrapping solutions have issues with the 'long' and currently 'non-standard' RGB SGR codes (i.e ^[[38;2;204;51;66m). This meant that, while it's possible to have wonderful, rich, full gamut colours and the aesthetic data visualisations it entails, it comes at the price of painful typography and corrupted console displays as text is broken up, unnaturally wrapped and becoming unreadable as the SGR codes are dashed against the rocks of 1980's shortsightedness, confusing your terminal and ever so slightly breaking the heart of design aware coders and administrators everywhere.

_Clearly this is unnacceptable!_

Previously, the only solution was to take a last, long whistful look at how great console colour could be, before going back to the, at best, 256 colours of the xterm pallette, with it's lack of useful greens and overly dark purples, or, for some, the even more cruelly devastating 16 colours of the ansi pallette, before heading to the stationary cupboard for a bit of a cry.

But weep no more!

Developed as part of our internal data visualisation system, where having the fidelity of 24 bit colour and embedded images (currently OS X iTerm 3 only) was a huge advantage.

Usable within your own node.js cli projects and an npm module or directly from the command line as a shell scripting command.

## CLI usage

#### To install using npm:

    npm install truwrap -g

To use simply pipe in a body of text to wrap according to the supplied options.

    cat README.md | truwrap --left 12 --right 12 --mode soft

#### Options

```console

> truwrap --help

truwrap v0.1.16

  Reads unformatted text from stdin and typographically applies paragraph wrapping it for the currently active tty.

  CLI Usage:
  Text stream (i.e cat, echo) | truwrap [OPTIONS]

  Options:
  -h, --help       Display this help.
  -v, --version    Return the current version. -vv Return name & version.
  -V, --verbose    Be verbose. -VV Be loquacious.
  -o, --stderr     Use stderr rather than stdout
  -l, --left       Left margin [default: 2]
  -r, --right      Right margin [default: 2]
  -w, --width      Width. Overrides right margin.
  -m, --mode       Wrapping mode: hard (break long lines), soft (keep white space) [default: "hard"]
  -e, --encoding   Set encoding. [default: "utf8"]
  -s, --stamp      Print arguments rather than stdin. printf-style options supported.
  -t, --table      Render a table into the available console width.
  -d, --delimiter  The column delimiter when rendering a table. [default: "|"]
  -x, --regex      Character run selection regex. Overrides --mode

```

## Programmatic usage

#### Basic use

```js
	var truwrap = require('truwrap')

	var writer = truwrap({
		left: 2
		right: -2
		mode: 'soft'
		encoding: 'utf8'
		outStream: process.stderr
	})

	var contentWidth = writer.getWidth()

	writer.write("Some text to write...", "...and some more.")
	writer.write("A new paragraph, if not implicitly present.")
	writer.end()
```

#### Advanced use

To add. Containers, Tables, Panels and Images.

#### Related

For advanced 24bit colour handling see [MarkGriffiths/trucolor](https://github.com/MarkGriffiths/trucolor) and [npm @thebespokepixel/trucolor](https://www.npmjs.com/package/@thebespokepixel/trucolor).


Initially a port of [substack/node-wordwrap](https://github.com/substack/node-wordwrap) to format yargs help output that contained (the very long) ansi 24bit color SGR codes.
