module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        extraResources: ["./database/**", "./icon/**","./attachment/**", "./etrc-icon/**", "./template/**"],
        productName: "AT Digital Tester",
        win: {
          target: ["nsis"],
          icon: "icon/icon.ico",
          requestedExecutionLevel: "requireAdministrator"
        },
        nsis: {
          guid : "ATDigitalTester",
          oneClick: true,
          include: "build/installer.nsh",
          installerIcon: "icon/icon.ico",
          uninstallerIcon: "icon/icon.ico",
          license : "build/license.txt",
          shortcutName  : "ATDigital Tester",
          oneClick: false,
          perMachine : true,
          createDesktopShortcut : true,
          allowToChangeInstallationDirectory : true,
          installerIcon: "icon/icon.ico",
          uninstallerIcon: "icon/icon.ico",
          uninstallDisplayName: "ATDigital Tester uninstaller"
        }
      }
    }
  }
}
