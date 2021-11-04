#### Installation

```shell
npm install --save @thebespokepixel/truwrap
```

```js
import {truwrap} from '@thebespokepixel/truwrap'

var writer = truwrap({
  left: 2,
  right: 2,
  mode: 'soft',
  outStream: process.stderr
})

var contentWidth = writer.getWidth()

writer.write("Some text to write...", "...and some more.")
writer.write("A new paragraph, if not implicitly present.")
writer.end() // Close the stream
```
As `outStream` was specified, wrapped output is written directly to the stream. 

### Images

If your terminal suppots them, you can add images into the wrapped output ste 

```js
import {truwrap, createImage} from '@thebespokepixel/truwrap'

const image = createImage({
  name: 'test',
  file: join(dirname(fileURLToPath(import.meta.url)), '../media/test.png'),
  width: 'auto', // Number of chars wide you'd like image. 'auto' to take it from the image/set height.
  height: 1,     // Number of lines the image will take
  space: '   '   //  A text string that is printed under the image so you can flow the wrapped text around it.
})

var renderer = truwrap({
  mode: 'container'
})

truwrap.write(image.render({
  nobreak: true,  // Don't add a linebreak after the image.
  stretch: false, // If true, distort the image the image to fit the width/height
  align: 1        // How many lines to move back up after printing the image.
  spacing: ' '    // A string to print after realigning the cursor after printing the image.
}))

console.log(truwrap.end())
```

As no `outStream` was specified `truwrap.end()` returns the wrapped text. 

### Panels

```js
import {truwrap, parsePanel} from '@thebespokepixel/truwrap'

var writer = truwrap({
  left: 2,
  right: 2,
  mode: 'soft',
  outStream: process.stderr
})

const panelSource = parsePanel(
  'One|Two|Three|Four', //Input text with column delimiters
  '|',                  // Column delimiter
  writer.getWidth()     // Total width (chars) to make columns across
)

const panelOptions = {
  maxLineWidth: writer.getWidth(),    // Maximum line width
  showHeaders: false,                 // Show colum headers
  truncate: false,                    // Truncate columns if too wide
  config: panelSource.configuration   // Get config information from parsePanel()
}

writer.panel(panelSource.content, panelOptions)
writer.end() //Close stream
```

### Related

For advanced 24bit colour handling see [thebespokepixel/trucolor](https://github.com/thebespokepixel/trucolor) and [npm trucolor](https://www.npmjs.com/package/trucolor).
