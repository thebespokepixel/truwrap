#### Installation

```shell
npm install --save @thebespokepixel/truwrap
```

#### Example

```js
/* Require (or import) the module… */
const badges = require('../../index.js')

/* …then do something with it. */
function renderBadges() {
   badges('readme').then(markdown => {
      /* Output markdown to console... */
      console.log(markdown)
   })
}
```

![Example Screengrab](https://raw.githubusercontent.com/MarkGriffiths/truwrap/master/media/example.png)
