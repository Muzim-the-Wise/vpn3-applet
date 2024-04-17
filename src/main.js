const {app, BrowserWindow, ipcMain, dialog, webContents} = require('electron');
const path = require('node:path');
try {
	require('electron-reloader')(module);
} catch {}
const util = require('node:util');
const execProm = util.promisify(require('node:child_process').exec);
const prompt = require('custom-electron-prompt');
const { title } = require('node:process');

const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    win.loadFile('index.html')
    return win;
  }

  const createSessWindow = (event) => {
    const win = new BrowserWindow({
      parent: BrowserWindow.getFocusedWindow(),
      modal: true,
      width: 1200,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  
    win.loadFile('indexSess.html')
  }

  async function handleConfsLs() {
    await execProm('mkdir -p ~/vpn3Confs');
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
  
  async function handleAddConf () {
    const { cancelled, filePaths } = await dialog.showOpenDialog({title: 'Select config', filters: [{name: 'configs', extensions: ['ovpn']}], defaultPath: '/home/${USER}'});
    if (!cancelled) {
      try{
        await execProm(`cp ${filePaths} ~/vpn3Confs/`);
        return true;
      } catch (error) {
        console.log(error.stderr);
        return false;
      }
    }
    return cancelled;
  }

  async function handleLogin() {
    const logpass = await prompt({
      title: "Enter logpass",
      label: "Login info",
      type: "multiInput",
      multiInputOptions:
        [
          {
            inputAttrs:
            {
              placeholder: "cc...",
              required: true
            }
          },
          {
            inputAttrs:
            {
              type: 'password',
              placeholder: "password",
              required: true
            }
          }
        ],
        resizable: false,
        width: 300,
        height: 225,
    })
    console.log(logpass);
    return logpass;
  }

  async function handleConnect (event, path, logpas) {
    try{
      const { stdout } = await execProm(`printf "${logpas[0]}\n${logpas[1]}\n" | openvpn3 session-start --config ${path}`);
      console.log(stdout);
      return stdout;
    } catch (error) {
      console.log(error.stderr);
      return error.stderr;
    }
  }
  
  async function handleDisconnect (event, path) {
    try{
      const { stdout } = await execProm(`openvpn3 session-manage --path ${path} --disconnect`);
      console.log(stdout);
      return stdout;
    } catch (error) {
      console.log(error.stderr);
      return false;
    }
  }

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  // app.on('login', (event, webContents, details, authInfo, callback) => {
  //   event.preventDefault();
  //   callback('username', 'secret');
  // })

  app.whenReady().then(() => {
    ipcMain.handle('getConfs', handleConfsLs);
    ipcMain.handle('getSessions', handleSessLs);
    ipcMain.handle('addConf', handleAddConf);
    ipcMain.handle('loginPromt', handleLogin);
    ipcMain.handle('connectVPN', handleConnect);
    ipcMain.handle('disconnect', handleDisconnect);
    ipcMain.handle('getSessWin', createSessWindow);
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
  })

  