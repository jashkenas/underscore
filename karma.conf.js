// Note some browser launchers should be installed before using karma start.

// For example:
//      $ npm install karma-firefox-launcher
//      $ karma start --browser=Firefox

// See https://karma-runner.github.io/0.8/config/configuration-file.html
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['qunit'],
    logLevel: config.LOG_INFO,
    port: 9876,

    // list of files / patterns to load in the browser
    files: [
      'test/qunit-setup.js',
      'underscore.js',
      'test/*.js'
    ],

    // Test results reporter to use
    // https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};