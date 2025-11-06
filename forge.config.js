const path = require('path');
const makers = [
  {
    name: '@electron-forge/maker-squirrel',
    arch: 'x64'
  }
];

if (process.platform === 'darwin') {
  makers.push(
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      arch: 'x64'
    }
  );
}

if (process.platform === 'linux') {
  makers.push(
    {
      name: '@electron-forge/maker-deb',
      arch: 'x64'
    },
    {
      name: '@electron-forge/maker-rpm',
      arch: 'x64'
    }
  );
}

module.exports = {
  packagerConfig: {
    icon: 'assets/icons/icon.ico',
    win32metadata: {
      minimumSystemVersion: '10.0.0'
    }
  },
  makers
};
