// import hic from 'juicebox.js';
// import igv from 'igv/dist/igv.esm.min';

const {app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const jquery = require('jquery');

// const hic = require('juicebox.js');
// const igv = require('igv/dist/igv.esm.min');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 900
  })

  // win.igv= igv;
  // win.hic= hic;
  win.$ = win.jQuery = jquery;

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    win.loadURL(startUrl);


  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
