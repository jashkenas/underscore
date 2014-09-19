module.exports = function(config) {
  if (!process.env.TRAVIS) {
    console.log("Sauce environments not set --- Skipping");
    return process.exit(0);
  }
  // Browsers to run on Sauce Labs platforms
  var sauceBrowsers = [
    ['Linux', 'android', '4.3'],
    ['Linux', 'android', '4.0'],
    ['Windows 8.1', 'firefox', '31'],
    ['Windows 8.1', 'firefox', '30'],
    ['Windows 8.1', 'firefox', '20'],
    ['Windows 8.1', 'chrome', '36'],
    ['Windows 8.1', 'chrome', '35'],
    ['Windows 8.1', 'internet explorer', '11'],
    ['Windows 8', 'internet explorer', '10'],
    ['Windows 7', 'internet explorer', '9'],
    ['Windows 7', 'internet explorer', '8'],
    ['Windows XP', 'internet explorer', '7'],
    ['Windows XP', 'internet explorer', '6'],
    ['Windows 7', 'opera', '12'],
    ['Windows 7', 'opera', '11'],
    ['OS X 10.9', 'ipad', '7.1'],
    ['OS X 10.6', 'ipad', '4'],
    ['OS X 10.9', 'safari', '7'],
    ['OS X 10.8', 'safari', '6'],
    ['OS X 10.6', 'safari', '5']
  ].reduce(function(memo, platform) {
    var label = (platform[1] + "_v" + platform[2]).replace(" ", "_").toUpperCase();
    memo[label] = {
      'base': 'SauceLabs',
      'browserName': platform[1],
      'platform': platform[0],
      'version': platform[2]
    };
    return memo;
  }, {});

  config.set({
    basePath: '',
    frameworks: ['qunit'],

    // list of files / patterns to load in the browser
    files: [
      'underscore.js',
      'test/*.js'
    ],
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'saucelabs'],
    // web server port
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    sauceLabs: {
      build: 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
      startConnect: true,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },

    // TODO(vojta): remove once SauceLabs supports websockets.
    // This speeds up the capturing a bit, as browsers don't even try to use websocket.
    transports: ['xhr-polling'],
    captureTimeout: 120000,
    customLaunchers: sauceBrowsers,
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: Object.keys(sauceBrowsers),
    singleRun: true
  });
};
