###JSON expected by Haring visualization

Expects sets of figure descriptions, with attributes
- color { 'red', 'blue', 'yellow', 'green', 'pink', 'orange' }
- column { 1, 2, 3 }
- type { 'dancing', 'running', 'flying' }
- info = a string to show in the tooltip of the figure

Each set of figures in the array will be a row.

```
[{ 
  figures: [
    {
      color: 'blue',
      column: 3,
      info: 'Some text to show in a tooltip',
      type: 'dancing'
    },
    {
      color: 'orange',
      column: 2,
      info: 'More info about why this is orange and in column 2',
      type: 'flying'
    }
  ]
 },
  ...
]
```