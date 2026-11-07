const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

const isDev = !!process.env.ELECTRON_START_URL;

// Where the packaged React build lives:
//   dev:  ../client/dist/index.html   (relative to desktop/)
//   prod: resources/app/index.html    (copied by electron-builder extraResources)
function resolveIndexHtml() {
  if (isDev) return null; // dev loads the Vite URL instead
  // In packaged app: process.resourcesPath/app/index.html
  if (app.isPackaged) return path.join(process.resourcesPath, 'app', 'index.html');
  // Unpackaged but built: fall back to sibling client/dist
  return path.join(__dirname, '..', 'client', 'dist', 'index.html');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: '#f4f6f9',
    title: 'MLMIS Admin',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.once('ready-to-show', () => win.show());

  if (isDev) {
    win.loadURL(process.env.ELECTRON_START_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(resolveIndexHtml()).catch((err) => {
      console.error('Failed to load index.html:', err);
      win.loadURL(
        'data:text/html,<h1 style="font-family:sans-serif;padding:40px;color:#b91c1c">' +
        'App files missing.<br>Run <code>npm run build:client</code> before packaging.</h1>'
      );
    });
  }

  // Open external links (e.g. WhatsApp web links) in system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) { shell.openExternal(url); return { action: 'deny' }; }
    return { action: 'allow' };
  });

  // Prevent navigating away from the app shell
  win.webContents.on('will-navigate', (e, url) => {
    if (!isDev && !url.startsWith('file://')) e.preventDefault();
  });
}

app.whenReady().then(() => {
  // Minimal app menu — remove default menu in production
  if (!isDev) Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});