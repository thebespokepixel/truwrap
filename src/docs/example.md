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
writer.end()
```

### Advanced use

To add. Containers, Tables, Panels and Images.

### Related

For advanced 24bit colour handling see [thebespokepixel/trucolor](https://github.com/thebespokepixel/trucolor) and [npm trucolor](https://www.npmjs.com/package/trucolor).
