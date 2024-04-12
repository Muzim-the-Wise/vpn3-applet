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

  async function handleSessLs() {
    try{
      const { stdout } = await execProm('openvpn3 sessions-list');
      const sessRegex = /Path: (.+?)\s+Created: (.+?)\s+PID: (\d+)\s+Owner: (.+?)\s+Device: (.+?)\s+Config name: (.+?)\s+\(Config not available\)\s+Session name: (.+?)\s+Status: (.+?)(?=\n\s+Path:|$)/gs;
      const parsedSess = [];
      let match;
      while ((match = sessRegex.exec(stdout)) !== null) {
        const entry = {
          Path: match[1].trim(),
          Created: match[2].trim(),
          PID: parseInt(match[3].trim()),
          Owner: match[4].trim(),
          Device: match[5].trim(),
          ConfigName: match[6].trim(),
          SessionName: match[7].trim(),
          Status: match[8].trim()
        };
        parsedSess.push(entry);
      }
      return parsedSess;
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
    ipcMain.handle('getConfs', handleConfsLs);
    ipcMain.handle('getSessions', handleSessLs);
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
  })