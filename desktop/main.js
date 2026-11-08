const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

const isDev = !!process.env.ELECTRON_START_URL;

function resolveIndexHtml() {
  if (isDev) return null;
  if (app.isPackaged) {
    // Standard electron-builder path for extraResources
    return path.join(process.resourcesPath, 'app', 'index.html');
  }
  // Fallback for local testing
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
        'App files missing.<br>Make sure you ran: <br><code>$env:BUILD_TARGET="electron"; npm run build</code> in the client folder.</h1>'
      );
    });
    
    // 👇 FORCE CONSOLE TO OPEN IN PRODUCTION SO WE CAN SEE THE ERROR 👇
    win.webContents.openDevTools(); 
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) { shell.openExternal(url); return { action: 'deny' }; }
    return { action: 'allow' };
  });

  win.webContents.on('will-navigate', (e, url) => {
    if (!isDev && !url.startsWith('file://')) e.preventDefault();
  });
}

app.whenReady().then(() => {
  if (!isDev) Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});