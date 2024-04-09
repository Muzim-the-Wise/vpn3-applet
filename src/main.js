const {app, BrowserWindow} = require('electron')
const path = require('node:path')
try {
	require('electron-reloader')(module);
} catch {}
const util = require('node:util');
const execProm = util.promisify(require('node:child_process').exec);

const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  
    win.loadFile('index.html')
  }

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  async function lsConfs() {
    try{
      const { stdout } = await execProm('ls ~/*.pngs');
    } catch (error) {
      console.log(error.stderr);
      return;
    }
    const confList = stdout.split("\n");
    console.log(confList)
    return stdout;
  }

  lsConfs();

  app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
  })