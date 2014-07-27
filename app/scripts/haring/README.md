###JSON expected by Haring visualization

Expects sets of figure descriptions, with attributes
- color { 'red', 'blue', 'dark-blue', 'yellow', 'green', 'dark-green', 'pink', 'orange' }
- type { 'dancing', 'running', 'flying' }
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
      info: 'Some text to show in a tooltip',
      initials: 'mmu'
    },
    {
      color: 'orange',
      type: 'flying',
      info: 'More info about why this is orange and in column 2',
      initials: 'ab'
    }, ...
  ]
}
```