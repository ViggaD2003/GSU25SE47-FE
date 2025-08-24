const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle module resolution
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, "jsx", "js", "ts", "tsx"],
  alias: {
    "@": "./src",
  },
  resolverMainFields: ["react-native", "browser", "main"],
  platforms: ["ios", "android", "native", "web"],
};

module.exports = config;
