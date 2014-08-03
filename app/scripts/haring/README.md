###JSON expected by Haring visualization

Expects sets of figure descriptions, with attributes
- color { 'red', 'yellow', 'pink', 'orange', 'blue', 'dark-blue', 'green', 'dark-green' }
  Can also be one of the following: { 'WARM', 'COLD' }, will then be chosen by vis accordingly
- type { 'dancing', 'running', 'flying' }
- border: {'solid' (default), 'dotted' }
- info = a string to show in the tooltip of the figure
- initials = letters to show as initials in a frame

Visualisation will iterate over the array of figures and put them into rows, left to right.

```
{
  background: <a-color>,
  figures: [
    {
      color: 'blue',
      type: 'dancing',
      border: 'solid',
      info: 'Some text to show in a tooltip',
      initials: 'mmu'
    },
    {
      color: 'orange',
      type: 'flying',
      border: 'dotted',
      info: 'More info about why this is orange and in column 2',
      initials: 'ab'
    }, ...
  ]
}
```