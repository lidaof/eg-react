# Server
## Installation
1.  Make sure that MongoDB is installed and started.
2.  Inside the `v1` directory, run `npm install`.
3.  Inside the root directory, run `npm install`.
4.  Inside the root directory, run `npm run setup` and follow the prompts.
5.  You're all set!

## Running
Running `npm start` in the root directory starts up both the backend and the React development server.  Again, make sure
MongoDB is up and running.  If you don't care about the back end, you may also run `npm start` in the `v1` directory.

# Client
## Quick tour
The client code is in the `v1` folder.  Here is a quick tour of `v1/src`:

* `components`: All React components.
* `dataSources`: API calls, AJAX calls, database connections, etc. that get data to display.
* `model`: data models.
* `stories`: stories for Storybook, on which unit tests depend.
* `vendor`: 3rd-party libraries that are not in NPM.

The most important classes may be `DisplayedRegionModel`, which holds the currently displayed region, and
`LinearDrawingModel`, which converts between base numbers and pixels.

## On SVGs
Drawing on SVGs is facilitated by `SvgContainer`.  This component requires a `DisplayedRegionModel` through its `model`
prop.  Any child of `SvgContainer` will automatically receive the following props once the svg has mounted:
* `svgNode`: the svg DOM node
* `model`: the same model that was passed to the `SvgContainer`
* `drawModel`: a `LinearDrawingModel`

A child component can then use these props in any way it sees fit.  For example, one can pass the svg DOM node to D3, or
SVG.js.  `SvgComponent` is a base class that uses SVG.js.

## Making a new track
1.  Extend the `DataSource` class, or use one that already exists.  Designing a new `DataSource` means implementing the
`getData()` method, which gets data for the view region passed to it.  You can return the data in any format desired.
`DataSource` would also be the best place to implement cache, if desired.
2.  Extend the `Track` class.  Render something based on `this.state.data`.  The data will come from whatever
`DataSource` is passed via props; the `Track` base class asks for data whenever the view changes.
`this.state.isLoading` will be true while data is loading, and `this.state.error`, will be set to whatever errors
`DataSource` returns, if any.
3.  Track components are created in `TrackContainer`.  Update the `switch` statement in `renderTrack()` to include your
track.

## Performance tips
Querying the width or height of any element, for example through `clientWidth` or `getBoundingClientRect()`, is slow.
Such queries take on the order of 2 to 20 ms.  While it is fine to do it once or twice, avoid doing it in a loop.
Suppose you aim to plot 500 data points on a SVG, and for each point you query the SVG's width.  That is already a
second or more of computation -- very noticable to the user!
