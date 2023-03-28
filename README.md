# ZapKeys

> The simplest way to make all your site’s interactions into keyboard shortcuts

Give your users the ability to efficiently navigate and interact with your whole site using only their keyboards. Turn them into power users. ⌨️

## What it does

With ZapKeys, users will be able to press <kbd>F</kbd> (or any other letter key; it's configurable), and every interactive element on the page – links, buttons, textareas, inputs – will be highlighted with a letter/sequence. Users can then press an element's letter/sequence and it will trigger that element's interaction – clicking on links and buttons, or focusing on inputs.

With minimal effort, your site becomes completely usable with only the keyboard.

Users don't need to figure out nor remember specific shortcut sequences and you don't have to configure them.

## Framework-agnostic

ZapKeys works directly on top of the DOM. So it does not matter how the DOM is generated. This means it can work alongside any framework or library like React, Vue, Ember, Angular and any other or none at all.

## Simplest Usage

1. For the functionality, in your javascript:

   ```js
   const shortcuts = new ZapKeys();
   shortcuts.init();
   ```

2. For the styles:

   ```css
   @import '~zapkeys/index.css';
   ```

   or in your JS:

   ```js
   import '~zapkeys/index.css';
   ```

## Custom Configuration

### Functionality

ZapKeys has a few configuration options, during instantiation:

| Option                   | Description                                                                                                       | Default |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------- |
| `startKey: string`       | The key what activates the shortcuts. Only supports single keys.                                                  | `"f"`   |
| `onActive: () => void`   | Function to execute when ZapKeys is active; when the start key has been pressed and the elements are highlighted. | none    |
| `onInactive: () => void` | Function to execute when ZapKeys becomes inactive; after an element has been triggered by a letter/sequence.      | none    |

To customize these, pass them during instantiation:

```js
const sk = new ZapKeys({
  startKey: 'x',
  onActive: () => console.log('It is active!'),
});
```

### Styling

ZapKeys includes nice defaults styles for the shortcut letter indicators, but if you'd like to customize them, you could do so by:

1. Not importing the `~zapkeys/index.css` file into your styles, and instead copying the CSS from it into your own, and
2. Updating the `.__zk-letter` styles to your heart's content:

   ```css
   /* ...rest of the styles remain the same... */

   .__zk-letter {
     /* remove the default styles and your custom styles here */
   }

   /* ...rest of the styles remain the same */
   ```
