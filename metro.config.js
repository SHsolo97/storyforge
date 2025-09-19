const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional asset extensions
config.resolver.assetExts.push(
  // Audio formats
  'mp3', 'wav', 'aiff', 'aac', 'm4a', 'flac',
  // Image formats
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'
);

module.exports = config;