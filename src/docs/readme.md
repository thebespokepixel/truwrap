# truwrap

> A node module for text wrapping into streams that supports 24bit color SGR codes.

${badges}

> **v4 Breaking change** The CLI command has been seperated into it's own repo [`truwrap-cli`][2]

Many current tty text wrapping solutions have issues with the 'long' and currently 'non-standard' RGB SGR codes (i.e `^[[38;2;204;51;66m`). This meant that, while it's possible to have wonderful, rich, full gamut colours and the aesthetic data visualisations it entails, it comes at the price of painful typography and corrupted console displays as text is broken up, unnaturally wrapped and becoming unreadable as the SGR codes are dashed against the rocks of 1980's shortsightedness, confusing your terminal and ever so slightly breaking the heart of design aware coders and administrators everywhere.

_Clearly this is unnacceptable!_

Previously, the only solution was to take a last, long whistful look at how great console colour could be, before going back to the, at best, 256 colours of the xterm pallette, with it's lack of useful greens and overly dark purples, or, for some, the even more cruelly devastating 16 colours of the ansi pallette, before heading to the stationary cupboard for a bit of a cry.

But weep no more!

Developed as part of our internal data visualisation system, where having the fidelity of 24 bit colour and embedded images (currently macOS iTerm only) was a huge advantage.

## Usage

${usage}

## Documentation
Full documentation can be found at [https://thebespokepixel.github.io/truwrap/][1]

[1]: https://thebespokepixel.github.io/truwrap/
[2]: https://github.com/thebespokepixel/truwrap-cli
