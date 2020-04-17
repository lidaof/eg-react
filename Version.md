# Version History

## 51.0.1

-   add tooltip for dynamic hic track
-   fixed one bug when `bigwig` files have just one zoomLevel causing `data fetch error`
-   a new option `alwaysDrawLabel` added to `bed` and `categorical` track for telling the browser always render the label
-   update nCoV2019 public hubs

## 51.0.0

-   added dynamic numerical track
-   added dynamic plot menu for >=2 numerical tracks
-   fixed a `virusBrowserMode` bug (redirected to main page) introduced in last few commits
-   fixed a bug long-range track data cannot have dot in chromosome names
-   added an option `zoomLevel` for `bigwig` track
-   changed custom track menu to remote track for better distinguish from local track
-   added dynamic hic plot track/menu
-   updated public hubs for nCoV2019

## 50.4.0

-   added 4 virus genomes for aiding virus research
-   global URL parameter `virusBrowserMode` added
-   VR freeze issue fixed
-   VR mode supports `longrange` track type now, thanks Silas for the help
-   certain public hubs added to 2019-nCoV by Changxu Fan

## 50.3.6

-   added sea hare genome (aplCal3) by Xiaoyu
-   added yeast sacCer3 genome
-   calling card track update by Arnav
-   multiple alignment track update by Xiaoyu

## 50.3.5

-   this version we implemented the PWA design
-   in case your device went offline, the [local track](https://eg.readthedocs.io/en/latest/local.html) and [local text track](https://eg.readthedocs.io/en/latest/text.html) function can still be used
-   whenever there is a new version, a notice will show if user still use the old version
-   fixed a bug for numerical track when there are negative values, set scale to fixed shifted values
-   fixed a bug metadata terms were loaded when hub was loaded from URL

## 50.3.1

-   fixed a small bug display view window in pixel
-   fixed numerical track y-axis scale while setting minimal y value

## 50.3.0

-   the `square` display for hic track is added
-   `add all tracks` button added for hub track table
-   text in `refbed` format supported

## 50.2.0

-   introducing the new support for text tracks, text files can be visualized directly in the browser, check the [documentation](https://eg.readthedocs.io/en/latest/text.html) for more details
-   text in `bed` format supported
-   text in `bedGraph` format supported
-   text in `longrange` format supported
-   please contact us for customized format

## 50.1.0

-   introduce a new track type `g3d` for genomic 3D structure display, see more at the [docs](https://eg.readthedocs.io/en/latest/tracks.html#d-genomic-structure-track)
-   fixed link to slack invitation

## 50.0.4

-   fixed a sequence fetch bug
-   fixed a 'browser content empty' error for `Go Live` function

## 50.0.3

-   add `sessionFile` URL param for loading a session file/state from URL
-   add new genome fruit fly `dm6` and C.elegans `ce11`

## 50.0.2

-   the browser can respond to window resize event now, thanks to Silas who stopped by and helped debug this function
-   add Zebrafish genome `danRer11`
-   from discussion with Arnav for `callingcard` track, plot a single circle (per track) at the midpoint of the interval

## 50.0.1

-   fixed a facet table bug when metadata is undefined, cannot distinguish track type with substrings like `bed` and `bedgraph`
-   fixed a session saving bug due to updated firebase related packages
-   when user define height in string like `"25"` instead of `25`, the browser won't complain
-   fixed a bug that genome align track shows data fetch error

## 50.0.0

-   this release is not an update for browser function but related to dependent package
-   updated to use `webpack` 4 and `typescript` 3.4
-   removed deprecated package `react-scripts-ts`, use typescript support from `create-react-app`
-   updated `react-app-rewired` to 2.1
-   motivated by [an issue](https://github.com/facebook/react/issues/16211) that ArcDisplay is not working on build version but development version

## 48.5.3

-   added chicken genome `galGal6` and `galGal5`
-   a `flatarc` mode added for chromatin interacion track:
    ![flat arc mode](https://eg.readthedocs.io/en/latest/_images/flatarc.png "Flat arc mode]")
-   fixed a metadata bug when define customized color

## 48.5.2

-   fixed a bug that facet table shows error count of loaded tracks
-   Rhesus `rheMac8` genome is added
-   fixed bug [#117](https://github.com/lidaof/eg-react/issues/117)
-   enabled multiple rows for categorical track when categories overlap

## 48.5.1

-   a new option `hiddenPixels` is added to control an item should be hidden for annotation tracks
-   fixed a bug that screenshot missed chromosome label in Ruler track
-   user can input track options while submit a custom track or local track
-   `url` in track of a custom datahub can use relative path

## 48.5.0

-   track height and color configuration enabled for genome align track
-   tooltip on heatmap and heatmap style of interaction track
-   annotation tracks adding UI will be shown when corresponding genome align track is added
-   fixed a bug that intra-region arcs are not displayed
-   fixed an [Unable to preventDefault inside passive event listener](https://github.com/facebook/react/issues/6436) bug
-   fixed the bug highlight region error when genomealign track is added, related to [#104](https://github.com/lidaof/eg-react/issues/104)
-   fixed an issue that tracks order in local hub doesn't follow order in `hub.config.json` file
-   local track supports BAM track now
-   fixed a bug that categorical track error when category not exists in hub file

## 48.4.6

-   tooltips on genome align track, both rough and fine mode (from Xiaoyu)
-   annotation tracks UI for genome align track
-   switched to latest [bam-js](https://github.com/GMOD/bam-js) from GMOD for bam file fetching

## 48.4.5

-   free text search for track in track table using [fuse.js](https://fusejs.io/)
-   pearson correlation value is added to scatter plot
-   add [YouTube channel](https://www.youtube.com/channel/UCnGVWbxJv-DPDCAFDQ1oFQA) link
-   fix a bug for screenshot app missed background color for tracks
-   cleaning package.json file
-   screenshot can now generate pdf as well using [svg2pdf.js](https://github.com/yWorks/svg2pdf.js), while the style may slight changed compared to SVG

## 48.4.4

-   `hammock` track type added with basic support
-   genome logo can now be clicked to change to another genome
-   mouse `mm9` and cow `bosTau8` added
-   arabidopsis `araTha1` (same as TAIR10) added
-   session can either be downloaded as a session file or a datahub file
-   highlight box color could be configured now
-   color configurable for boxplot in geneplot
-   marker size and color configurable for scatter plot
-   heatmap type in geneplot switched back to using plotly.js as well

## 48.4.3

-   fixed a bug for long-range track has negative score
-   add line width config for interaction track when displayed as arcs
-   updated to hic-straw 0.9.0 as suggested by Jim Robinson
-   fixed a bug when reading local .hic file caused `data fetch error`
-   removed timeout mechanism for bigwig tracks

## 48.4.2

-   added the scatter plot app
-   enabled canvas renderer for arc and heatmap display of chromatin interaction tracks
-   enabled height config for chromatin interaction tracks

## 48.4.1

-   use CND hosted plotly scripts to reduce script bundle size
-   fix a bug that screenshot app shows left expanded region when there is interaction track
-   use [nivo](https://github.com/plouc/nivo) library for heatmap in geneplot app
-   fix a bug that values for geneplot missed strand information
-   fix a bug certain gene symbol cannot be found in geneplot
-   fix a bug strand for region sets by default sets to `-`

## 48.4.0

-   matplot function is added
-   configuration for matplot track is added with `smooth`, `aggregate methods`, `line width` etc.

## 48.3.1

-   retina screen display improved as track rendered in canvas
-   SNP search through [Ensembl API](https://rest.ensembl.org)
-   SNP track added as well, data comes from Ensembl API
-   Aggregate method is configurable for numerical tracks, `MEAN`, `SUM`, `COUNT`, `MAX`, `MIN` are supported, `MEAN` is default
-   `smooth` option added for numerical tracks

## 48.3.0

-   new function to re-order many tracks at one time by drap and drop
-   new hot key (Alt+G) to open the interface for re-order many function
-   new track type `callingcard` for displaying Calling card data
-   new function geneplot for plot overall signal from a numerical track over a gene/region set
-   function to download current session to local disk
-   accept session files uploaded from local disk

## 48.2.1

-   use [hic-straw](https://github.com/igvteam/hic-straw) package for .hic data source, removed the dependency to igv.js and juicebox.js
-   added `FetchSequence` App to allow fetch sequence of current region or user specified regions
-   Fix a bug while upload file hub causing page freeze
-   Rough alignment enhanced by Xiaoyu

## 48.2.0

-   genome alignment track enhanced view, improved by Xiaoyu Zhuo
-   allow users to upload local file as tracks
-   allow users to upload entire folder or many files as a data hub by creating a `hub.config.json` file
-   HiC track normalization implemented by Silas Hsu

## 47.2.8

-   first stable version since we start coding the new version of the browser code
-   embedding browser function is available
-   browser code also uploaded to npm
-   (version number prior to 47 refers to the old browser codebase)
