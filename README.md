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
### 1.  Write a new track component (required)
1.  Make a new component expecting to receive a bunch of props from `TrackContainer`.  `Track.js` documents the props
to expect.
2.  Your new component may `render` anything, though it is **highly** recommended you render a `<Track>` component, if
not one of the more specialized components like `<AnnotationTrack>` or `<NumericalTrack>`.  Pass *all* track container
props to these sub-components.
3.  In addition to track container props, you need to provide certain props to these sub-components, all of which the
respective files document.
    * For example, `<Track>` requires a legend and visualizer element.  Use the track container props, which includes
    view region and width, to render a visualizer and pass it to `<Track>`.

#### Adding data fetch, etc.
[Higher-order components](https://reactjs.org/docs/higher-order-components.html) manage common funtionality like data
fetching.  The `commonComponents` directory contains track-specific HOCs; their names start with `config-` or `with-`.

For example, `configStaticDataSource` returns a *function* with which you can wrap your new track component.  After you
use this function, your component will automatically receive three additional props `data`, `isLoading`, and `error`,
whose function are self-explanatory.  In particular, if `isLoading` is false, the `data` prop is guaranteed to be in
sync with the view region.

### 2.  Specify context menu components (optional)
Specify context menu items with an array of components.  You can choose existing ones in the `contextMenu` directory, or
make new ones.
* Make sure you are specifying Component *classes*, not component instances.
* All tracks have some menu items by default, such as the one modifying label and the one removing the track. You should
should not include these default items.

### 3.  Specify default options (optional)
Default option objects look like the `options` prop of `TrackModel` objects.  Context menu items will read these options
if the track model does not specify them.  Make sure these options are consistent with the way you are rendering your
track component!  The `configOptionMerging` HOC should help with that.

### 4.  Configure when to render your shiny new component
1.  Package your new component, menu item list, and default options into one configuration object with props
`component`, `menuItems`, and `defaultOptions`.
2.  Import the object from step 1 into `track/subtypeConfig.js`.
3.  Add an appropriate entry to `TYPE_NAME_TO_SUBTYPE` in `track/subtypeConfig.js`, which maps track type name to track
configurations.  Alternatively, for very fine-grained control, you can modify the functions in the file directly.

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
