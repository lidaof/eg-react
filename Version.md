# Version History

## 48.4.0

* matplot function is added
* configuration for matplot track is added with `smooth`, `aggregate methods`, `line width` etc.

## 48.3.1

* retina screen display improved as track rendered in canvas
* SNP search through [Ensembl API](https://rest.ensembl.org)
* SNP track added as well, data comes from Ensembl API
* Aggregate method is configurable for numerical tracks, `MEAN`, `SUM`, `COUNT`, `MAX`, `MIN` are supported, `MEAN` is default
* `smooth` option added for numerical tracks

## 48.3.0

* new function to re-order many tracks at one time by drap and drop
* new hot key (Alt+G) to open the interface for re-order many function
* new track type `callingcard` for displaying Calling card data
* new function geneplot for plot overall signal from a numerical track over a gene/region set
* function to download current session to local disk
* accept session files uploaded from local disk

## 48.2.1

* use [hic-straw](https://github.com/igvteam/hic-straw) package for .hic data source, removed the dependency to igv.js and juicebox.js
* added `FetchSequence` App to allow fetch sequence of current region or user specified regions
* Fix a bug while upload file hub causing page freeze
* Rough alignment enhanced by Xiaoyu

## 48.2.0

* genome alignment track enhanced view, improved by Xiaoyu Zhuo
* allow users to upload local file as tracks
* allow users to upload entire folder or many files as a data hub by creating a `hub.config.json` file
* HiC track normalization implemented by Silas Hsu

## 47.2.8

* first stable version since we start coding the new version of the browser code
* embedding browser function is available
* browser code also uploaded to npm
* (version number prior to 47 refers to the old browser codebase)
