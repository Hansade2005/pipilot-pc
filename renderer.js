// renderer.js
// Runs in the web page (after preload). Handles UI or events.

console.log('Renderer loaded successfully.');

window.addEventListener('DOMContentLoaded', () => {
  console.log('PiPilot.dev page loaded directly in Electron window.');
  updateMaximizeButton();
});

// Window control functions
function minimizeWindow() {
  window.electronAPI.minimizeWindow();
}

function closeWindow() {
  window.electronAPI.closeWindow();
}

function toggleMaximize() {
  window.electronAPI.toggleMaximize();
  // Update button after a short delay to allow state change
  setTimeout(updateMaximizeButton, 100);
}

function updateMaximizeButton() {
  const btn = document.getElementById('maximizeBtn');
  if (btn && window.electronAPI.isMaximized()) {
    btn.textContent = '❐'; // Restore icon
  } else if (btn) {
    btn.textContent = '□'; // Maximize icon
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Function to show a notification
async function showNotification(title, body) {
  try {
    await window.notificationsAPI.showNotification(title, body);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// Function to show a random notification from a category
async function showRandomNotification(category) {
  try {
    await window.notificationsAPI.showRandomNotification(category);
  } catch (error) {
    console.error('Error showing random notification:', error);
  }
}

// Cookie management functions for renderer process
async function getCookies(filter = {}) {
  try {
    const cookies = await window.cookiesAPI.getCookies(filter);
    return cookies;
  } catch (error) {
    console.error('Error getting cookies:', error);
    return [];
  }
}

async function setCookie(details) {
  try {
    await window.cookiesAPI.setCookie(details);
    return true;
  } catch (error) {
    console.error('Error setting cookie:', error);
    return false;
  }
}

async function removeCookie(url, name) {
  try {
    await window.cookiesAPI.removeCookie(url, name);
    return true;
  } catch (error) {
    console.error('Error removing cookie:', error);
    return false;
  }
}

async function flushCookieStore() {
  try {
    await window.cookiesAPI.flushCookieStore();
    return true;
  } catch (error) {
    console.error('Error flushing cookie store:', error);
    return false;
  }
}

// Function to hide the loading overlay
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Initialize Lucide icons
function initializeIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Update theme icon based on current theme
async function updateThemeIcon() {
  try {
    if (window.darkMode) {
      const themeInfo = await window.darkMode.getTheme();
      const iconElement = document.getElementById('theme-icon');
      
      if (iconElement) {
        if (themeInfo.themeSource === 'dark' || 
            (themeInfo.themeSource === 'system' && themeInfo.shouldUseDarkColors)) {
          // Set to moon icon for dark theme
          iconElement.setAttribute('data-lucide', 'moon');
        } else {
          // Set to sun icon for light theme
          iconElement.setAttribute('data-lucide', 'sun');
        }
        
        // Reinitialize the icon
        initializeIcons();
      }
    }
  } catch (error) {
    console.error('Error updating theme icon:', error);
  }
}

// Theme toggle functions
function toggleThemeDropdown() {
  const dropdown = document.getElementById('themeDropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }
}

async function setTheme(theme) {
  try {
    if (window.darkMode) {
      if (theme === 'system') {
        await window.darkMode.system();
      } else {
        // Get current theme to determine if we need to toggle
        const currentTheme = await window.darkMode.getTheme();
        let needsToggle = false;
        
        if (theme === 'dark' && !currentTheme.shouldUseDarkColors) {
          needsToggle = true;
        } else if (theme === 'light' && currentTheme.shouldUseDarkColors) {
          needsToggle = true;
        }
        
        if (needsToggle) {
          await window.darkMode.toggle();
        }
      }
      
      // Close the dropdown after selection
      const themeDropdown = document.getElementById('themeDropdown');
      if (themeDropdown) {
        themeDropdown.style.display = 'none';
      }
      
      // Update the theme icon
      setTimeout(updateThemeIcon, 100); // slight delay to ensure theme is applied
    }
  } catch (error) {
    console.error('Error setting theme:', error);
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById('themeDropdown');
  const themeToggle = document.querySelector('.theme-toggle');
  
  if (dropdown && themeToggle && dropdown.style.display === 'block' && 
      !themeToggle.contains(event.target) && 
      !dropdown.contains(event.target)) {
    dropdown.style.display = 'none';
  }
});

// Prevent dropdown from closing when clicking inside it
document.getElementById('themeDropdown')?.addEventListener('click', function(event) {
  event.stopPropagation();
});

// Initialize theme icon when DOM is loaded
window.addEventListener('DOMContentLoaded', async () => {
  initializeIcons(); // Initialize icons
  await updateThemeIcon(); // Initialize theme icon
});

// Example: Show a welcome notification when the app loads
window.addEventListener('DOMContentLoaded', async () => {
  // Show a welcome notification after a short delay
  setTimeout(() => {
    showRandomNotification('welcome');
  }, 3000);
});

// Function to hide the loading overlay
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Handle webview events
document.addEventListener('DOMContentLoaded', () => {
  const webview = document.getElementById('mainWebView');
  
  if (webview) {
    webview.addEventListener('did-finish-load', () => {
      console.log('PiPilot page loaded successfully.');
      hideLoading();
    });
    
    webview.addEventListener('did-fail-load', (event) => {
      console.error('Failed to load page:', event);
      // You could show an error message here
    });

    webview.addEventListener('did-navigate', (event) => {
      console.log('Navigated to:', event.url);
      // Show loading overlay again on navigation
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) {
        overlay.style.display = 'flex';
      }
    });

    // Notification support
    webview.addEventListener('ipc-message', (event) => {
      if (event.channel === 'notification') {
        const [title, body] = event.args;
        showNotification(title, body);
      }
    });
  }
});