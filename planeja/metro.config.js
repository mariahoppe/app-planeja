const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const stubTopicos = path.join(
  path.dirname(require.resolve('expo-notifications/package.json')),
  'build/TopicSubscriptionModule.js'
);

const resolverPadrao = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'android' &&
    moduleName === './TopicSubscriptionModule' &&
    context.originModulePath.includes('expo-notifications')
  ) {
    return { type: 'sourceFile', filePath: stubTopicos };
  }
  return (resolverPadrao ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
