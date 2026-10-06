const updateMetadataUrl = process.env.APP_UPDATE_FEED_URL || 'http://localhost/'

module.exports = {
    pluginOptions: {
        electronBuilder: {
            preload: 'src/preload.js',
            builderOptions: {
                appId: 'com.at.digitaltester',
                productName: 'AT Digital Tester',
                artifactName: 'AT-Digital-Tester-Setup-${version}.${ext}',
                publish: {
                    provider: 'generic',
                    // Runtime checks replace this with the configured service domain.
                    url: updateMetadataUrl
                },
                extraResources: ['./icon/**', './attachment/**', './etrc-icon/**', './template/**', './extra_binaries/**'],
                win: {
                    target: ['nsis'],
                    icon: 'icon/icon.ico'
                },
                nsis: {
                    guid: 'ATDigitalTester',
                    shortcutName: 'ATDigital Tester',
                    installerIcon: 'icon/icon.ico',
                    uninstallerIcon: 'icon/icon.ico',
                    uninstallDisplayName: 'ATDigital Tester Uninstaller',
                    license: 'build/license.txt',
                    include: 'build/installer.nsh',
                    oneClick: false,
                    perMachine: false,
                    createDesktopShortcut: true,
                    allowToChangeInstallationDirectory: true,
                    allowElevation: false
                },
                mac: {
                    target: ['dmg', 'zip'],
                    icon: 'icon/icon.icns',
                    category: 'public.app-category.developer-tools',
                    hardenedRuntime: true
                },
                dmg: {
                    title: 'Install AT Digital Tester',
                    icon: 'icon/icon.icns',
                    window: {
                        width: 540,
                        height: 380
                    },
                    contents: [
                        {x: 130, y: 220},
                        {x: 410, y: 220, type: 'link', path: '/Applications'}
                    ]
                }
            }
        }
    }
}
