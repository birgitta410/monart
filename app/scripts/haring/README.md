###JSON expected by Haring visualization

Expects sets of figure descriptions, with attributes
- color { 'red', 'blue', 'dark-blue', 'yellow', 'green', 'dark-green', 'pink', 'orange' }
- type { 'dancing', 'running', 'flying' }
- info = a string to show in the tooltip of the figure

Visualisation will iterate over the array of figures and put them into rows, left to right.

```
{
  background: <a-color>,
  figures: [
    {
      color: 'blue',
      info: 'Some text to show in a tooltip',
      type: 'dancing'
    },
    {
      color: 'orange',
      info: 'More info about why this is orange and in column 2',
      type: 'flying'
    }, ...
  ]
}
```