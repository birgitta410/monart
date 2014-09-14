###JSON expected by Miro visualization

Expects sets of shape descriptions, with attributes
- color { 'red', 'white', 'black' }
- size { 'small', 'medium', 'large' }
- info = a string to show in the tooltip of the figure
- showInfo = a boolean indicating if the tooltip info should be displayed by default, without the need to hover; default false

One 'stroke', list of 'stones'.

```
{
  stroke: { 
    color: 'red',
    info: 'Why the stroke is red'
  },
  stones: [
    {
      color: 'black',
      size: 'large',
      info: 'Some text to show in a tooltip',
      showInfo: true
    },
    {
      color: 'black',
      size: 'small'
      info: 'More info about why this is black and small'
    }, ...
  ]
}
```