const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // Attendre que la fenêtre soit prête pour lancer la commande
  mainWindow.webContents.on('did-finish-load', () => {
    // Lorsque la fenêtre est prête, vous pouvez activer la gestion de la commande
    ipcMain.on('start-command', (event, data) => {
      const { repoURL, launchCommand } = data;

      // Exécutez la commande avec child_process.spawn
      const childProcess = spawn('vmg', ['--', '-r', repoURL, '-c', launchCommand]);

      // Rediriger la sortie de la commande vers la fenêtre Electron
      childProcess.stdout.on('data', (data) => {
        mainWindow.webContents.send('command-output', data.toString());
      });

      childProcess.stderr.on('data', (data) => {
        mainWindow.webContents.send('command-error', data.toString());
      });

      childProcess.on('close', (code) => {
        mainWindow.webContents.send('command-exit', code);
      });
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
