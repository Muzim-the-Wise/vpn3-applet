const {app, BrowserWindow, ipcMain} = require('electron')
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

  async function handleConfsLs() {
    execProm('mkdir -p ~/vpn3Confs');
    try{
      const { stdout } = await execProm('ls ~/vpn3Confs/*.ovpn');
      const confList = stdout.split("\n");
      confList.pop();
      return confList;
    } catch (error) {
      console.log(error.stderr);
      return false;
    }
  }
  // lsConfs().then(function(res) {
  //   console.log(res);
  // })
  


  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  app.whenReady().then(() => {
    ipcMain.handle('getConfs', handleConfsLs);
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
  })