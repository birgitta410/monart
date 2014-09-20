###JSON expected by Haring visualization

Expects sets of figure descriptions, with attributes
- color { 'red', 'yellow', 'pink', 'orange', 'blue', 'dark-blue', 'green', 'dark-green' }
  Can also be one of the following: { 'WARM', 'COLD' }, will then be chosen by vis accordingly
- type { 'dancing', 'running', 'flying' }
- border: {'solid' (default), 'dotted' }
- info = a string to show in the tooltip of the figure
- showInfo = a boolean indicating if the tooltip info should be displayed by default, without the need to hover; default false
- initials = letters to show as initials in a frame

Visualisation will iterate over the array of figures and put them into rows, left to right.

Global visualisation attributes:
- background { 'red', 'yellow', 'pink', 'orange', 'blue', 'dark-blue', 'green', 'dark-green' } = background color
- announcementFigure = a large figure that will appear as overlay over the visualisation (careful with the words, if they are too long they might screw up the layout)


```
{
  background: <a-color>,
  announcementFigure: {
    color: 'green',
    type: 'crawling_takeoff',
    border: 'dotted',
    word1: 'great',
    word2: 'success'
  },
  figures: [
    {
      color: 'blue',
      type: 'dancing',
      border: 'solid',
      info: 'Some text to show in a tooltip',
      showInfo: true,
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