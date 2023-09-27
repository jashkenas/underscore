var _ = require('./');

// Browsers to run on Sauce Labs platforms
// (See https://saucelabs.com/platform/supported-browsers-devices for an
// up-to-date overview of supported versions of browsers and platforms.)
var sauceBrowsers = _.reduce([
  ['firefox', 'latest'],
  ['firefox', '60'],
  ['firefox', '40'],
  ['firefox', '11'],
  // ['firefox', '4'],  // failing due to "not enough arguments"

  ['chrome', 'latest'],
  ['chrome', '60'],
  ['chrome', '40'],
  ['chrome', '26'],

  // latest Edge as well as pre-Blink versions
  ['microsoftedge', 'latest', 'Windows 10'],
  ['microsoftedge', '18', 'Windows 10'],
  ['microsoftedge', '13', 'Windows 10'],

  ['internet explorer', 'latest', 'Windows 10'],
  ['internet explorer', '10', 'Windows 8'],
  ['internet explorer', '9', 'Windows 7'],
  // Older versions of IE no longer supported by Sauce Labs

  ['safari', 'latest', 'macOS 10.15'],
  ['safari', '12', 'macOS 10.14'],
  ['safari', '11', 'macOS 10.13'],
  ['safari', '8', 'OS X 10.10'],

], function(memo, platform) {
  // internet explorer -> ie
  var label = platform[0].split(' ');
  if (label.length > 1) {
    label = _.invoke(label, 'charAt', 0)
  }
  label = (label.join("") + '_v' + platform[1]).replace(' ', '_').toUpperCase();
  memo[label] = _.pick({
    'base': 'SauceLabs',
    'browserName': platform[0],
    'version': platform[1],
    'platform': platform[2]
  }, Boolean);
  return memo;
}, {});

module.exports = function(config) {
  if ( !process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY ) {
    console.log('Sauce environments not set --- Skipping');
    return process.exit(0);
  }

  config.set({
    basePath: '',
    frameworks: ['qunit'],
    singleRun: true,
    browserDisconnectTolerance: 5,
    browserNoActivityTimeout: 240000,

    // list of files / patterns to load in the browser
    files: [
      'test/vendor/qunit-extras.js',
      'test/qunit-setup.js',
      'test/overrides.js',
      'underscore-umd.js',
      'test/*.js'
    ],

    // Number of sauce tests to start in parallel
    concurrency: 9,

    // test results reporter to use
    reporters: ['dots', 'saucelabs'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    sauceLabs: {
      build: 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
      startConnect: true,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },

    captureTimeout: 120000,
    customLaunchers: sauceBrowsers,

    // Browsers to launch, commented out to prevent karma from starting
    // too many concurrent browsers and timing sauce out.
    browsers: _.keys(sauceBrowsers)
  });
};
