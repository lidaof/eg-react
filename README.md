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
  * Legend
  * Data source
2.  Specify when to render your new track.

### 1. Customizations
These are also explained in `TrackSubtype.ts`.
#### Visualizer (required)
A component that visualizes your track data.  It will receive `VISUALIZER_PROP_TYPES` (defined in `Track.js`).

#### Legend
Your track legend component.  It will receive `LEGEND_PROP_TYPES` (defined in `Track.js`).

If you don't specify a legend, your track will display a minimal, default legend.

#### Data source
If you have any non-trival data fetching needs, extend the `DataSource` class, or use one that already exists.
Designing a new `DataSource` involves implementing the `getData()` method, which gets data for the view region passed to
it.  You can return the data in any format desired.  This would also be the best place to implement cache, if desired.

If you don't specify a data source, your legend and visualizer will receive no data.

### 2.  Using your shiny customizations
1.  Package your customizations into an object matching the schema in `TrackSubtype.ts`.
2.  Import the object from step 1 into `Track.js`.
3.  Add an entry to `TYPE_NAME_TO_SUBTYPE` in `Track.js`, which maps track type name to track subtype objects, such as
the one you created in step 1.  The type name will come from the `TrackModel` passed to `Track` components.

## Performance tips
Querying the width or height of any element, for example through `clientWidth` or `getBoundingClientRect()`, is slow.
Such queries take on the order of 2 to 20 ms.  While it is fine to do it once or twice, avoid doing it in a loop.
Suppose you aim to plot 500 data points on a SVG, and for each point you query the SVG's width.  That is already a
second or more of computation -- very noticable to the user!

## React gotchas
* When using native DOM events, they take priority over React events.  This is because React waits for events to bubble
to the root component before handling them.  This can cause undesirable effects: for example, calling
`stopPropagation()` on a React event will not actually stop native events.  This StackOverflow post may also help if you
have propagation problems: https://stackoverflow.com/questions/24415631/reactjs-syntheticevent-stoppropagation-only-works-with-react-events
* React *always* unmounts components if their parents change type.  The `Reparentable` component works around this by
using app-unique IDs, but it can cause side effects with React's native events.  Use with care.
