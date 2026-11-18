const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix: reselect (used by Redux Toolkit) ships .mjs files — Metro needs to know about them
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs"];

module.exports = withNativeWind(config, { input: "./global.css" });