'use strict'

import { app, protocol, BrowserWindow, dialog } from 'electron'
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
const isDevelopment = process.env.NODE_ENV !== 'production'

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

log.info('App Starting...')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// https://github.com/iffy/electron-updater-example/blob/master/main.js
function sendStatusToWindow(text) {
  log.info(text)
  win.webContents.send('message', text)
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...')
})

autoUpdater.on('update-available', info => {
  sendStatusToWindow('Update available.')
})

autoUpdater.on('update-not-available', info => {
  sendStatusToWindow('Update not available.')
})

autoUpdater.on('error', err => {
  sendStatusToWindow('Error in auto-updater.' + err)
})

autoUpdater.on('download-progress', progressObj => {
  let logMessage = 'Download speed:' + progressObj.bytesPerSecond
  logMessage = logMessage + ' - Download ' + progressObj.percent + '%'
  logMessage = logMessage + '(' + progressObj.transferred + '/' + progressObj.total + ')'
  sendStatusToWindow(logMessage)
})

autoUpdater.on('update-downloaded', (e, releaseNotes, ReleaseName) => {
  let message = app.getName() + ' ' + ReleaseName

  if (releaseNotes) {
    message += '\n\n内容\n'
    releaseNotes.split(/[^\r]\n/).forEach(note => {
      message += note + '\n\n'
    })
  }
  dialog.showMessageBox(
    {
      type: 'question',
      button: ['再起動', 'あとで'],
      defaultId: 0,
      message: '新しいバージョンをダウンロードしました。再起動しますか？',
      detail: message
    },
    res => {
      if (res === 0) {
        setTimeout(() => autoUpdater.quitAndInstall(), 1)
      }
    }
  )
})

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify()
})
