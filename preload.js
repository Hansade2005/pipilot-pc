// preload.js
// Runs before the renderer; can safely expose APIs or environment data.

const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  // Display Electron and Chrome versions if desired
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});

// Safe exposure of limited Node.js API to the renderer
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});

// Expose window control functions
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  toggleMaximize: () => ipcRenderer.send('toggle-maximize'),
  isMaximized: () => ipcRenderer.sendSync('is-maximized'),
  send: (channel, data) => ipcRenderer.send(channel, data)
});

// Expose notification functions
contextBridge.exposeInMainWorld('notificationsAPI', {
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  showRandomNotification: (category) => ipcRenderer.invoke('show-random-notification', category),
  showPopulatedNotification: (category, customData) => ipcRenderer.invoke('show-populated-notification', category, customData)
});

// Expose user data functions
contextBridge.exposeInMainWorld('userAPI', {
  getUserData: () => ipcRenderer.invoke('get-user-data'),
  getIndexedDBUserData: () => ipcRenderer.invoke('get-indexeddb-user-data'),
  updateProfile: (profileData) => ipcRenderer.invoke('update-user-profile', profileData),
  updateActivity: (type, value) => ipcRenderer.invoke('update-user-activity', type, value)
});

// Expose cookie functions
contextBridge.exposeInMainWorld('cookiesAPI', {
  getCookies: (filter) => ipcRenderer.invoke('get-cookies', filter),
  setCookie: (details) => ipcRenderer.invoke('set-cookie', details),
  removeCookie: (url, name) => ipcRenderer.invoke('remove-cookie', url, name),
  flushCookieStore: () => ipcRenderer.invoke('flush-cookie-store')
});

// Expose dark mode functions
contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system'),
  getTheme: () => ipcRenderer.invoke('dark-mode:get-theme')
});