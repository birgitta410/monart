###JSON expected by Haring visualization

Expects sets of figure descriptions, with attributes
- color { 'red', 'yellow', 'pink', 'orange', 'blue', 'dark-blue', 'green', 'dark-green' }
  Can also be one of the following: { 'WARM', 'COLD' }, will then be chosen by vis accordingly
- type { 'buildin', 'fail', 'fail_repeated', 'great_success', 'passed', 'passed_after_fail' }
- border: {'solid' (default), 'dotted' }
- info = a text to show in the info overlay, detail level 1
- info2 = a text to show in the info overlay, detail level 2
- showInfo = a boolean indicating if the info layover for this figure should be displayed immediately on figure update; default false
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
    type: 'great_success',
    word1: 'great',
    word2: 'success'
  },
  figures: [
    {
      color: 'blue',
      type: 'fail',
      border: 'solid',
      info: 'Some text to show in info overlay',
      showInfo: true,
      initials: 'mmu'
    },
    {
      color: 'orange',
      type: 'passed',
      border: 'dotted',
      info: 'More info about why this is orange',
      initials: 'ab'
    }, ...
  ]
}
```