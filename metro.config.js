const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  server: {
    port: 8081,
    host: '127.0.0.1'
  },
  watchFolders: [__dirname]
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
