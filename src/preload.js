const { contextBridge, ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  })

  contextBridge.exposeInMainWorld('electronAPI', {
    getConfs: () => ipcRenderer.invoke('getConfs'),
    getSessions: () => ipcRenderer.invoke('getSessions'),
    addConf: () => ipcRenderer.invoke('addConf'),
    login: () => ipcRenderer.invoke('loginPromt'),
    connectVPN: (path, logpas) => ipcRenderer.invoke('connectVPN', path, logpas),
    getSessWin: () => ipcRenderer.invoke('getSessWin'),
    disconnect: (path) => ipcRenderer.invoke('disconnect', path)
  })
  