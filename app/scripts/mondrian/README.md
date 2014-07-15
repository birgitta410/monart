###JSON expected by Mondrian visualization

Expects an array of rectangle descriptions, with attributes
- color { 'red', 'blue', 'yellow' }
- column { 1, 2, 3 }
- size { 'small', 'medium', 'large' }
- info = a string to show in the tooltip of the rectangle


```
[
  {
    color: 'blue',
    column: 3,
    info: 'Some text to show in a tooltip',
    size: 'large'
  },
  {
    color: 'red',
    column: 2,
    info: 'More info about why this is red and in column 2',
    size: 'medium'
  },
  ...
]
```