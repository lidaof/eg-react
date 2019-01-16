const {app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

// require('electron-debug')();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: true
    },
    width: 1281,
     height: 900,
     minWidth: 1281,
     minHeight: 900,
     icon: path.join(__dirname, '../build/icon.icns')
  })

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    win.loadURL(startUrl);

    // win.loadURL('http://localhost:3000/browser');

    win.webContents.openDevTools();
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


// require('electron-debug')({showDevTools: true, enabled: true});

// const isDev = require('electron-is-dev');

// if (isDev) {
// 	console.log('Running in development');
// } else {
// 	console.log('Running in production');
// }