// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge } = require("electron");
const remoteFetch = require('node-fetch');
// const gfh = require('generic-filehandle');
 const { LocalFile } = require('generic-filehandle');
 const { BigWig } = require('@gmod/bbi');
 const fs = require('fs');
 const JSON5 = require('json5');

// As an example, here we use the exposeInMainWorld API to expose the browsers
// and node versions to the main window.
// They'll be accessible at "window.versions".
process.once("loaded", () => {
  contextBridge.exposeInMainWorld("versions", process.versions);
  contextBridge.exposeInMainWorld("remoteFetch", remoteFetch);
  contextBridge.exposeInMainWorld("fs", fs);
  // contextBridge.exposeInMainWorld("gfh", gfh);
  contextBridge.exposeInMainWorld("nodeGFH", {
    createLocalFile(path) {
      console.log(path, new LocalFile(path));
      return JSON.stringify(new LocalFile(path));
    }
  });
  // contextBridge.exposeInMainWorld("nodeGFH", {
  //   createLocalBWFile(path) {
  //     console.log(path, new LocalFile(path), new BigWig({ filehandle: new LocalFile(path) }));
  //     return JSON5.stringify(new BigWig({ filehandle: new LocalFile(path) }));
  //   }
  // });
});