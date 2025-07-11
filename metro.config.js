const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações para resolver problemas com SQLite e outros módulos nativos
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.unstable_enableSymlinks = false;
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Adicionar configurações específicas para resolver problemas de módulos
config.resolver.alias = {
  'react-native-sqlite-storage': 'expo-sqlite'
};

// Configurações para resolver problemas de carregamento de módulos
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
