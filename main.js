// main.js
// Main process to control application life and create a native browser window.

const { app, BrowserWindow, ipcMain, session, Notification, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// Set AppUserModelID for proper icon usage on Windows
app.setAppUserModelId('com.hansade2005.pipilot');

let mainWindow;
let splashWindow;
let walkthroughWindow;

// User data storage
let userData = {
  profile: {
    firstName: 'Developer',
    memberSince: new Date().toISOString(),
    preferences: {}
  },
  activity: {
    commitsToday: 0,
    hoursToday: 0,
    tasksCompleted: 0,
    currentStreak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0]
  },
  app: {
    version: app.getVersion() || '1.0.0',
    installDate: new Date().toISOString(),
    lastUpdateCheck: new Date().toISOString()
  }
};

// User data management functions
async function loadUserData() {
  try {
    const userDataPath = path.join(app.getPath('userData'), 'userData.json');
    const data = await fs.readFile(userDataPath, 'utf8');
    userData = { ...userData, ...JSON.parse(data) }; 
    console.log('User data loaded successfully');
  } catch (error) {
    console.log('No existing user data found, using defaults');
    // Save default data
    await saveUserData();
  }
}

async function saveUserData() {
  try {
    const userDataPath = path.join(app.getPath('userData'), 'userData.json');
    await fs.writeFile(userDataPath, JSON.stringify(userData, null, 2));
    console.log('User data saved successfully');
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

// ... (rest of your file remains unchanged)