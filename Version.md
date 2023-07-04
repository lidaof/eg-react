# Version History

## 54.0.4

-   add `pixelsPadding` option for `modbed` track while display in heatmap mode, used for padding the drawing tick pixel

## 54.0.3

-   fix an bug that screenshot UI doesn't show axis label
-   fix #319

## 54.0.2

-   Fix Chrome 112 Navbar nested css problem (by Shane)
-   small changes to modbed base pair level visualization

## 54.0.1

-   new genome for _Parhyale hawaiensis_ version 5 is added
-   added an option to hide minimal annotations
-   removed some old version gene annotation tracks (files can be requested if still need)

## 54.0.0

-   added new track type `modbed` for display long read sequencing methylation data
-   added ensembl style for matplot and dynamic tracks
-   fixed a screenshot bug when svg imported to Adobe Illustrator
-   removed default highlight for gene/snp/region search
-   added `highlightPosition` url parameter, used with `position`, for example `&position=chr3:181429711-181432223&highlightPosition=1` will jump to `chr3:181429711-181432223` and highlight it at same time

## 53.8.0

-   added light/dark theme setting
-   added view sharing via email/embed/QR code

## 53.7.0

-   added MANE select 1.0 for hg38
-   updated gencode tracks for hg38, hg19, mm39 and mm10
-   add opitimization for dropbox shared hubs

## 53.6.3

-   3D viewer can enable region set view from segments
-   fixed a bug that MIN/MAX aggregator in numeric track crash
-   added `t2t-chm13-v2.0`
-   fixed sceenshot issue with genome align track, reported by #252
-   added highlights in screenshot by #251

## 53.6.2

-   `rn7` added
-   `qBed` add secondary color config and horizontal line option per Slack user request
-   imporved highlighting functions

## 53.6.1

-   changed circlet view UI slightly
-   added chord view
-   added Jaspar 2022 TF tracks to Annotation track sets

## 53.6.0

-   new genomes `susScr3`, `calJac4`, `rheMac10` added.
-   UI, button styles changes from Shane Liu
-   added cookie consent notice

## 53.5.2

-   new genomes `susScr11`, `oviAri4` and Brapa ([#228](https://github.com/lidaof/eg-react/issues/228)) added.
-   image tracks/hubs update
-   add new feature to allow long range tracks with colors for each arc/heatmap diamond

## 53.5.1

-   add spin utility for 3d model viewer
-   add `clampHeight` option to chromatin interaction track for `arc` and `heatmap` style

## 53.5.0

-   removed unnecessary re-render of numerical track
-   adding push notification
-   allow HiC track bin size and normalization options linked to the hic file itself
-   add an option `italicizeText` to allow _italic_ text/label on gene tracks
-   new genome `xenTro10` added

## 53.4.1

-   added `bigchain` format support
-   `bigchain` and `genomealign` can be added from remote track UI with specify a query genome
-   layout header height bug fix
-   region jumping following UCSC Browser: position coordinates `chr6:130129863-130129899` (1 based, 37bp), bed coordinate `chr6 130129863 130129899` (0 based, 36bp)

## 53.4.0

-   new T2T genome assembly `t2t-chm13-v1.1` added
-   improved 3D module
-   support Repeatmasker V2 format bigbed, track type `rmskv2`

## 53.3.2

-   for `bigwig` track, specify `ensemblStyle` option to `true` can enable data with chromosome names as 1, 2, 3...work in the browser
-   `bedcolor` track type
-   Roadmap (hg38) hub update
-   more genome alignment tracks
-   pdf output label alignment improvement

## 53.3.1

-   switched to `@gmod/bbi` library for bigwig data fetching
-   removed zoom level configuration for bigWig track

## 53.3.0

-   updated 4DN data hubs
-   fixed a screenshot bug while tracks are grouped

## 53.2.0

-   introduce `boxplot` track type show numerical data in small window as boxplots

## 53.1.0

-   `vcf` track bug fix for certain tooltip clicking
-   updated SARS-CoV-2 data hubs by Changxu Fan

## 53.0.0

-   3D structure view module added, for more please check [the 3D documentation](https://eg.readthedocs.io/en/latest/3d.html)
-   basic support for `vcf` format

## 52.5.2

-   add an option `queryEndpoint` to `TrackModel` allow customization of gene/feature annotaion query
-   added 2 new Trypanosome genomes `TbruceiTREU927` and `TbruceiLister427` per user's request

## 52.5.1

-   fixed a bug that `dynseq` track doesn't work correctly in Safari
-   fixed a bug that screenshot error on `hic` heatmap mode
-   fixed a bug that `longrange` track cannot change name/label
-   added a feature that sessions are sorted by date by dafault, can change to sorting by label
-   add a new track type `rgbpeak` to show the peaks in `bigbed` format supporting `itemRgb` attribute
-   added a new virus genome `hpv16`, ref sequence from https://www.ncbi.nlm.nih.gov/nuccore/NC_001526.4, gene annotation from https://www.ncbi.nlm.nih.gov/assembly/GCF_000863945.3/

## 52.5.0

-   Dynamic sequence track type `dynseq` added, the track type is proposed and initially developped by Surag Nair from Anshul Kundaje's lab at Stanford University

## 52.4.1

-   bug fix: numerical track y-scale threshold not working for negative values
-   bug fix: local data hub missed track's `metadata` attibute

## 52.4.0

-   added percentile scale for interaction tracks (`hic`, `longrange`) etc.
-   improved fixed scale config for numerical tracks
-   video output for dynamic track
-   added the highlight beams for interaction track at `heatmap` mode

## 52.3.0

-   fixed a bug that hic track fetches whole hic file when switch to other norm options with updated hic-straw package
-   fixed a bug that numerical track shows wrong threshold for negative data values
-   6 new genomes added
-   new `noDefaultTracks` url parameter remove the default tracks while loading a remote hub
-   removed limitation that querygenome of `genomealign` track need be preconfigured
-   added default width and height for `withAutoDimensions` module
-   enhanced `genomeailgn` track by Silas Hsu

## 52.2.0

-   add the API key and secret for accessing 4DN tracks

## 52.1.0

-   added new genome `Plasmodium falciparum (Pfal3D7)`
-   fixed one bug that bam track at density mode not showing y scale config
-   fixed a bug when load `g3d` track from datahub caused browser track facet table lost
-   fixed issue #111 and #176 for long range track data filtering
-   add option to avoid use firebase database by remove session/live function (see doc for details)

## 52.0.0

-   upgrade dependent packages: react, react-dom -> 16.13.1
-   supports nodejs v12+
-   SARS-CoV-2 hubs updated by Fan
-   fixed a `smooth` option caused display issue (related to #163)
-   improved window/container resize listener using ResizeObserver API
-   improved responsive layout of navigation menu and tools bar
-   modified vendor `bigwig.js` to support chromosome names like `chr1` or `1`
-   introduced image track:
    ![image track example](https://eg.readthedocs.io/en/latest/_images/image_track_example.png "image track example")

## 51.0.6

-   track file information can be displayed with track data (like resolution and normalization for `hic`, `g3d` track etc)
-   new 'snv' track for display sequence variations from reference
-   update hubs of virus genomes

## 51.0.5

-   updated SARS-CoV-2 publib hubs and default tracks
-   enabled tracks can be loaded from both hub url and previous session storage with new URL parameter `hubSessionStorage`
-   fixed a `qBed` when mouseover outside of the track caused TypeError bug
-   fixed a bug that remote hub load button not working in Firefox

## 51.0.4

-   add dynamic arc view for dynamic hic tracks
-   fixed a bug arc with negative score not show up in screenshot
-   dynamic colors `dynamicColors` are supported for all dynamic tracks

## 51.0.3

-   add a new option `greedyTooltip` for arc display of chromatin interaction data, this option will show more than one interaction from same 2 loci if exists
-   track type `callingcard` renamed to 'qBed'
-   update `hic-straw` package

## 51.0.2

-   fixed a crash bug when reize window with a dynamic bedgraph track
-   added dynamic labels to dynamic tracks
-   fixed a bug when zooming in a dynamic bedgraph data not show

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
    ![flat arc mode](https://eg.readthedocs.io/en/latest/_images/flatarc.png "Flat arc mode")
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
