# Server
## Installation
Follow the instructions in `backend/mongo.txt`.  MongoDB must be running.

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

## Making a new track component
Here's an overview:
1.  Specify customizations of your new track.  Tracks are customizable in four ways:
  * Visualizer (required)
  * Legend (required)
  * Context menu items
  * Track default options
  * Data source
2.  Specify what track type renders your new track.

### 1. Customizations
These are also explained in `TrackSubtype.ts`.
#### Visualizer (required)
A component that visualizes your track data.  It will receive `VISUALIZER_PROP_TYPES` (defined in `Track.js`).

#### Legend (required)
Your track legend component.  It will receive `LEGEND_PROP_TYPES` (defined in `Track.js`).

#### Context menu items
List of specific menu items to render.  Note that all tracks have some menu items by default, such as the one modifying
label and the one removing the track.  You should not include these default items.

#### Default options
Object that looks like the `options` prop of `TrackModel` objects.  Visualizers, legends, and context menu items will
receive an options object which is track model's options merged into the default options for the track type.

#### Data source
If you have any non-trival data fetching needs, extend the `DataSource` class, or use one that already exists.
Designing a new `DataSource` involves implementing the `getData()` method, which gets data for the view region passed to
it.  You can return the data in any format desired.  This would also be the best place to implement cache, if desired.

If you don't specify a data source, your legend and visualizer will receive no data.

### 2.  Using your shiny customizations
Components use customizations via the getSubtypeConfig() method, which returns `TrackSubtype` objects.

1.  Package your customizations into an object matching the schema in `track/TrackSubtype.ts`.
2.  Import the object from step 1 into `track/subtypeConfig.js`.
3.  Add an entry to `TYPE_NAME_TO_SUBTYPE` in `track/subtypeConfig.js`, which maps track type name to track subtype
objects, such as the one you created in step 1.  Alternatively, for very fine-grained control, you can modify the
functions in the file directly.

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
