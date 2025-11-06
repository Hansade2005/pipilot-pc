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

// Update user activity data
function updateUserActivity(type, value) {
  switch (type) {
    case 'commits':
      userData.activity.commitsToday = (userData.activity.commitsToday || 0) + value;
      break;
    case 'hours':
      userData.activity.hoursToday = (userData.activity.hoursToday || 0) + value;
      break;
    case 'tasks':
      userData.activity.tasksCompleted = (userData.activity.tasksCompleted || 0) + value;
      break;
    case 'streak':
      userData.activity.currentStreak = value;
      break;
  }
  saveUserData();
}

// Notification data
const notifications = {
  update: [
    {
      title: '🆕 New Features',
      body: 'Version {version} is here! Check out {featureCount} new features.'
    },
    {
      title: '🔧 Bug Fixes',
      body: 'We fixed {bugCount} issues based on your feedback. Thank you!'
    },
    {
      title: '⚡ Performance Upgrade',
      body: 'App is now 50% faster! Experience the speed boost.'
    },
    {
      title: '🎨 UI Refresh',
      body: 'New look, same power! Check out our redesigned dashboard.'
    },
    {
      title: '🔐 Security Update',
      body: 'Important security update installed. Your projects are more secure now!'
    },
    {
      title: '📱 Mobile Improvements',
      body: 'Mobile experience enhanced with touch-optimized controls!'
    },
    {
      title: '🌐 New Integrations',
      body: 'Now integrated with {serviceCount} more services! Expand your toolkit.'
    },
    {
      title: '📊 Analytics Dashboard',
      body: 'New analytics dashboard with real-time insights is now live!'
    },
    {
      title: '🎯 API v2.0',
      body: 'Our new API is faster and more powerful. Check the migration guide.'
    },
    {
      title: '🔔 Notification System',
      body: 'Smart notifications are here! Customize your preferences now.'
    }
  ],
  welcome: [
    {
      title: '🎉 Welcome to PiPilot!',
      body: 'Hi {firstName}! Let\'s build your first project together.'
    },
    {
      title: '🚀 Getting Started',
      body: 'Complete your profile to unlock all features and start building!'
    },
    {
      title: '💎 Pro Features Unlocked',
      body: 'Welcome to Pro! You now have access to unlimited projects and deployments.'
    },
    {
      title: '👋 Nice to Meet You!',
      body: 'Join {memberCount}+ developers building amazing apps. Your journey starts now!'
    },
    {
      title: '🎁 Welcome Gift',
      body: 'Claim your {creditAmount} free credits to get started! Valid for 30 days.'
    }
  ],
  onboarding: [
    {
      title: '📝 Step 1: Create Your First Project',
      body: 'Choose a template or start from scratch. It takes just 2 minutes!'
    },
    {
      title: '🔗 Step 2: Connect Your GitHub',
      body: 'Link your GitHub account for seamless deployments and version control.'
    },
    {
      title: '🚀 Step 3: Deploy to Production',
      body: 'Your app is ready! Deploy it to the world with one click.'
    },
    {
      title: '🎓 Quick Tour',
      body: 'Take a 3-minute tour to discover all the powerful features!'
    },
    {
      title: '✅ Setup Complete!',
      body: 'You\'re all set! Start building your next big idea now.'
    }
  ],
  evening_reminder: [
    {
      title: '🌙 Evening Wrap-Up',
      body: 'Great work today! You made {commitsCount} commits. Rest well!'
    },
    {
      title: '💤 Time to Unwind',
      body: 'You coded for {hoursToday} hours today. Take a break and recharge!'
    },
    {
      title: '📊 Daily Progress',
      body: 'Today\'s achievement: {tasksCompleted} tasks completed! See your stats.'
    },
    {
      title: '✨ Tomorrow\'s Plan',
      body: 'Plan tomorrow\'s work now and start fresh in the morning!'
    },
    {
      title: '🔖 Bookmark Progress',
      body: 'Save your current work state so you can pick up right where you left off!'
    },
    {
      title: '🌟 Daily Highlight',
      body: 'Your best moment today: Completed {projectName}! Celebrate it!'
    },
    {
      title: '💪 Streak Status',
      body: '{streakDays} day streak! Don\'t forget to commit tomorrow.'
    },
    {
      title: '📝 Notes & Ideas',
      body: 'Have any ideas for tomorrow? Jot them down now!'
    },
    {
      title: '🎯 Tomorrow\'s Goals',
      body: 'Set {goalCount} goals for tomorrow and start strong!'
    },
    {
      title: '🌃 Good Night!',
      body: 'Rest well, {firstName}. Tomorrow brings new opportunities!'
    }
  ]
};

// Function to show a notification
function showNotification(title, body) {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: body
    });

    notification.on('show', () => console.log('Notification shown'));
    notification.on('click', () => console.log('Notification clicked'));
    notification.on('close', () => console.log('Notification closed'));

    notification.show();
    return true;
  } else {
    console.log('Notifications are not supported on this system');
    return false;
  }
}

// Function to show a random notification from a category
function showRandomNotification(category) {
  if (notifications[category] && notifications[category].length > 0) {
    const randomIndex = Math.floor(Math.random() * notifications[category].length);
    const notification = notifications[category][randomIndex];
    return showNotification(notification.title, notification.body);
  }
  return false;
}

// Function to populate notification templates with dynamic data
function populateNotificationTemplate(template, data = {}) {
  let populated = {
    title: template.title,
    body: template.body
  };

  // Use real user data with fallbacks
  const defaultData = {
    // App/System data
    version: userData.app.version,
    featureCount: data.featureCount || Math.floor(Math.random() * 10) + 1,
    bugCount: data.bugCount || Math.floor(Math.random() * 20) + 1,
    serviceCount: data.serviceCount || Math.floor(Math.random() * 5) + 1,

    // User profile data
    firstName: userData.profile.firstName,

    // Community data (could be fetched from server)
    memberCount: data.memberCount || Math.floor(Math.random() * 10000) + 1000,

    // Monetary data
    creditAmount: data.creditAmount || Math.floor(Math.random() * 50) + 10,

    // Activity data from user tracking
    commitsCount: userData.activity.commitsToday || 1,
    hoursToday: userData.activity.hoursToday || Math.floor(Math.random() * 8) + 1,
    tasksCompleted: userData.activity.tasksCompleted || Math.floor(Math.random() * 10) + 1,
    projectName: data.projectName || 'My Awesome Project',
    streakDays: userData.activity.currentStreak || 1,
    goalCount: data.goalCount || Math.floor(Math.random() * 5) + 1,

    // Add more dynamic data sources as needed
    ...data // Allow overriding with custom data
  };

  // Replace placeholders in both title and body
  Object.keys(defaultData).forEach(key => {
    const placeholder = `{${key}}`;
    const value = defaultData[key];
    populated.title = populated.title.replace(new RegExp(placeholder, 'g'), value);
    populated.body = populated.body.replace(new RegExp(placeholder, 'g'), value);
  });

  return populated;
}

// Function to show a populated notification from a category
function showPopulatedNotification(category, customData = {}) {
  if (notifications[category] && notifications[category].length > 0) {
    const randomIndex = Math.floor(Math.random() * notifications[category].length);
    const template = notifications[category][randomIndex];
    const populated = populateNotificationTemplate(template, customData);
    return showNotification(populated.title, populated.body);
  }
  return false;
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'splash-preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false,
    resizable: false
  });

  splashWindow.loadFile('splash.html');

  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });

  ipcMain.once('splash-complete', () => {
    splashWindow.close();
    createWalkthroughWindow();
  });
}

function createWalkthroughWindow() {
  walkthroughWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'splash-preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
  });

  walkthroughWindow.loadFile('walkthrough.html');

  walkthroughWindow.once('ready-to-show', () => {
    walkthroughWindow.show();
  });

  ipcMain.once('walkthrough-complete', () => {
    walkthroughWindow.close();
    createMainWindow();
  });
}

function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // ⚠️ disabled only for local testing
      webviewTag: true // Enable webview tag
    },
    show: false
  });

  // Configure session to better handle login sessions
  const filter = {
    urls: ['https://*/*', 'http://*/*']
  };

  // Set user agent to appear like a regular browser
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Safari/537.36';
    // Ensure cookies are sent with all requests
    callback({ requestHeaders: details.requestHeaders });
  });

  // Handle redirects properly
  mainWindow.webContents.session.webRequest.onBeforeRedirect(filter, (details) => {
    // Log redirects to help with debugging
    console.log('Redirect from:', details.redirectURL);
  });

  // Ensure cookies are handled consistently
  mainWindow.webContents.on('did-navigate', (event, url) => {
    console.log('Navigating to:', url);
  });

  // Handle cookies for login sessions
  mainWindow.webContents.on('did-finish-load', async () => {
    try {
      // Query all cookies for debugging
      const cookies = await session.defaultSession.cookies.get({});
      console.log('Current cookies:', cookies);
      
      // Set up cookie change listener for monitoring
      session.defaultSession.cookies.on('changed', (event, cookie, cause, removed) => {
        if (!removed) {
          console.log('Cookie set:', cookie);
        } else {
          console.log('Cookie removed:', cookie);
        }
      });
      
      // Additional cookie management functions for login
      // Function to get cookies for specific URL
      const getSiteCookies = async (url) => {
        try {
          const cookies = await session.defaultSession.cookies.get({ url: url });
          return cookies;
        } catch (error) {
          console.error('Error getting cookies for URL:', url, error);
          return [];
        }
      };
      
      // Function to set a cookie
      const setCookie = async (cookieDetails) => {
        try {
          await session.defaultSession.cookies.set(cookieDetails);
          console.log('Cookie set successfully:', cookieDetails.name);
        } catch (error) {
          console.error('Error setting cookie:', error);
        }
      };
      
      // Function to remove a cookie
      const removeCookie = async (url, name) => {
        try {
          await session.defaultSession.cookies.remove(url, name);
          console.log('Cookie removed successfully:', name);
        } catch (error) {
          console.error('Error removing cookie:', error);
        }
      };
      
      // Function to flush cookie store to disk
      const flushCookieStore = async () => {
        try {
          await session.defaultSession.cookies.flushStore();
          console.log('Cookie store flushed to disk');
        } catch (error) {
          console.error('Error flushing cookie store:', error);
        }
      };
      
      // Store these functions in the main window for potential use
      mainWindow.getSiteCookies = getSiteCookies;
      mainWindow.setCookie = setCookie;
      mainWindow.removeCookie = removeCookie;
      mainWindow.flushCookieStore = flushCookieStore;
      
    } catch (error) {
      console.error('Error handling cookies:', error);
    }
  });

  // Load the main app
  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Test populated notification after a short delay
    setTimeout(() => {
      console.log('Testing populated notification...');
      showPopulatedNotification('welcome', {
        firstName: userData.profile.firstName,
        memberCount: 15420 // Example real data
      });
    }, 3000);

    // Test evening reminder with activity data
    setTimeout(() => {
      console.log('Testing evening reminder...');
      showPopulatedNotification('evening_reminder');
    }, 6000);
  });

  // Optional: open DevTools automatically
  // mainWindow.webContents.openDevTools();
}

// Window control handlers
ipcMain.on('minimize-window', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.minimize();
  }
});

ipcMain.on('close-window', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.close();
  }
});

ipcMain.on('toggle-maximize', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    if (focusedWindow.isMaximized()) {
      focusedWindow.unmaximize();
    } else {
      focusedWindow.maximize();
    }
  }
});

ipcMain.on('is-maximized', (event) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  event.returnValue = focusedWindow ? focusedWindow.isMaximized() : false;
});

// Cookie handlers
ipcMain.handle('get-cookies', async (event, filter) => {
  try {
    const cookies = await session.defaultSession.cookies.get(filter || {});
    return cookies;
  } catch (error) {
    console.error('Error getting cookies:', error);
    throw error;
  }
});

ipcMain.handle('set-cookie', async (event, details) => {
  try {
    await session.defaultSession.cookies.set(details);
    return true;
  } catch (error) {
    console.error('Error setting cookie:', error);
    throw error;
  }
});

ipcMain.handle('remove-cookie', async (event, url, name) => {
  try {
    await session.defaultSession.cookies.remove(url, name);
    return true;
  } catch (error) {
    console.error('Error removing cookie:', error);
    throw error;
  }
});

ipcMain.handle('flush-cookie-store', async (event) => {
  try {
    await session.defaultSession.cookies.flushStore();
    return true;
  } catch (error) {
    console.error('Error flushing cookie store:', error);
    throw error;
  }
});

// Theme handlers
ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light';
  } else {
    nativeTheme.themeSource = 'dark';
  }
  return nativeTheme.shouldUseDarkColors;
});

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'system';
});

ipcMain.handle('dark-mode:get-theme', () => {
  return {
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
    themeSource: nativeTheme.themeSource
  };
});

// Notification handlers
ipcMain.handle('show-notification', async (event, title, body) => {
  return showNotification(title, body);
});

ipcMain.handle('show-random-notification', async (event, category) => {
  return showRandomNotification(category);
});

ipcMain.handle('show-populated-notification', async (event, category, customData) => {
  return showPopulatedNotification(category, customData);
});

// User data handlers
ipcMain.handle('get-user-data', async (event) => {
  return userData;
});

ipcMain.handle('update-user-profile', async (event, profileData) => {
  userData.profile = { ...userData.profile, ...profileData };
  await saveUserData();
  return userData.profile;
});

ipcMain.handle('update-user-activity', async (event, type, value) => {
  updateUserActivity(type, value);
  return userData.activity;
});

// Configure the session at app level to better handle login sessions
app.whenReady().then(async () => {
  // Load user data first
  await loadUserData();

  // Set default theme to dark
  nativeTheme.themeSource = 'dark';

  // Configure session settings to better handle login sessions
  // Set a custom user agent for all requests in the default session
  session.defaultSession.webRequest.onBeforeSendHeaders({
    urls: ['https://*/*', 'http://*/*']
  }, (details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Safari/537.36';
    callback({ requestHeaders: details.requestHeaders });
  });



  createSplashWindow();

  app.on('activate', () => {
    // On macOS recreate a window when clicking the dock icon
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
