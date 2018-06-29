# Server
## Installation
Enter the `backend` directory.  `npm install`, and then `npm run setup`.  MongoDB must be running.

## Running
1.  Make sure MongoDB is running.
2.  Enter the `backend` directory.
3.  `npm start`.
4.  Enter the `frontend` directory.
5.  `npm start`.

# Client
## Quick tour
The client code is in the `frontend` folder.  Here is a quick tour of `frontend/src`:

* `components`: All React components.
  * `genomeNavigator`: the navigation bar at the top that allows users to navigate
  * `track`: track-related components
  * `trackManagers`: UI that manages adding tracks
* `dataSources`: API calls, AJAX calls, database connections, etc. that get data to display.
* `model`: data models.
* `stories`: stories for Storybook, on which unit tests depend.
* `vendor`: 3rd-party libraries that are not in NPM.

## Suggested order of reading
If you plan to understand the app as a whole, here's a suggested order of code to read:
1.  `Feature`: a feature or annotation in the genome
2.  `NavigationContext`: a list of `Feature` that represents everywhere a user can navigate.  If the `Feature`s are
actually entire chromosomes, then the user can effectively navigate the whole genome.
3.  `DisplayedRegionModel`: an interval in a `NavigationContext`
4.  `App`: the root component of the app
5.  From `App`, descend into interested components.

## Making a new track type
### Make a new TrackConfig
Make a new class that extends `TrackConfig`, or one of its subclasses.  This class packages many essential track
characteristics:

* `getComponent()` - gets the component that renders the main visualizer and legend of the track.
* `getMenuComponents()` - specifies context menu items in an array of components.  You can choose existing ones
in the `contextMenu` directory, or make new ones.
* `getOptions()` - the visualizer probably renders with default options, like a color.  This method returns a plain
object containing those options.

You do not have to implement these methods immediately, as the base `TrackConfig` class provides minimal defaults.
Just work on making the browser render *some* temporary placeholder at first.

### Specify when to use the TrackConfig
1.  Import your new TrackConfig into `trackConfig/getTrackConfig.js`.
2.  Add an appropriate entry to `TYPE_NAME_TO_SUBTYPE`, which maps track type name to track renderer.

### Write a new track visualizer component (implement `getComponent()`)
1.  Make a new component expecting to receive a bunch of props from `TrackContainer`.  `Track.js` documents the props
to expect.
2.  If you need data, assume it will come through the `data` prop.  We will add data fetch in the next step.
3.  Your new component may `render` anything, though it is **highly** recommended you render a `<Track>` component, if
not one of the more specialized components like `<AnnotationTrack>` or `<NumericalTrack>`.  Pass *all* track container
props to these sub-components.
4.  In addition to track container props, you need to provide certain props to these sub-components, all of which the
respective files document.
    * For example, `<Track>` requires a legend and visualizer element.  Use the track container props, which includes
    view region and width, to render a visualizer and pass it to `<Track>`.

### Add data fetch
Available data sources are in the `dataSources` folder.  If none of them fulfill your needs, write a new class that
fulfills the interface of `DataSource.js`.  More can be found in that file.

How do we give your visualizer data?  [Higher-order components](https://reactjs.org/docs/higher-order-components.html)!
`track/commonComponents` contains track-specific HOCs; their names start with `config-` or `with-`.

`configStaticDataSource` requests a callback that returns a `DataSource` and then returns a *function* that wraps React
components.  After you use this function, a component will automatically receive three props `data`, `isLoading`, and
`error`.  These update with the browser's current view region.  In particular, the HOC guarantees synchronization of the
`data` prop with the current view region if `isLoading` is false.

### 2.  Specify context menu components (implement `getMenuComponents()`)
Specify context menu items with an array of components.  You can choose existing ones in the `contextMenu` directory, or
make new ones.
* Make sure the method returns Component *classes*, not component instances.

### 3.  Specify default options
Default option objects look like the `options` prop of `TrackModel` objects.  Context menu items will read these options
if the track model does not specify them.  Make sure these options are consistent with the way you are rendering your
track component!  The `configOptionMerging` HOC should help with that.

Once you have a default options object, call `setDefaultOptions()` in the constructor of `TrackConfig` to use them.

## Performance tips
Querying the width or height of any element, for example through `clientWidth` or `getBoundingClientRect()`, is slow.
Such queries take on the order of 2 to 20 ms.  While it is fine to do it once or twice, avoid doing it in a loop.
Suppose you aim to plot 500 data points on a SVG, and for each point you query the SVG's width.  That is already a
second or more of computation -- very noticable to the user!

## React (and other) gotchas
* On Macs, control + click is the same as a right click, which fires a `contextmenu` event.  Note that `click` events
do not fire on `contextmenu` events.  The `mousedown` and `mouseup` events will still fire, though.
* When using native DOM events, they take priority over React events.  This is because React waits for events to bubble
to the root component before handling them.  This can cause undesirable effects: for example, calling
`stopPropagation()` on a React event will not actually stop native events.  This StackOverflow post may also help if you
have propagation problems: https://stackoverflow.com/questions/24415631/reactjs-syntheticevent-stoppropagation-only-works-with-react-events
* React *always* unmounts components if their parents change type.  The `Reparentable` component works around this by
using app-unique IDs, but it can cause side effects with React's native events.  Use with care.
* Webpack does not support circular dependencies, and while compilation may be successful, an import may resolve as
`undefined` at runtime.

## Lessons trying to refactor into WebWorkers
1.  Data fetch and track display options are intimately related.  For example, what if someone wants HiC data and
selects the 5KB resolution option?
2.  Thus, for each track type, we have one object that gets the track component, default rendering options, and data
fetch/processing.
3.  Webpack hangs forever if it encounters a cyclic dependency involving a webworker.
4.  The code as in (2) causes a cyclic depdendency.  This cycle is [config object] --> [data source] --> [worker] -->
[track config deserializer] --> [config object]
5.  We cannot have our cake and eat it too.

Unfortunately, this means we cannot pipeline all expensive computation in worker context, while also ensuring track
component and data source live in the same place.
