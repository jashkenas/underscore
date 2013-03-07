'use strict';

module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                curly: false,
                eqeqeq: false,
                latedef: false,
                eqnull: true,
                expr: true,
                supernew: true,
                evil: true
            },

            src: ['underscore.js'],
            node: ['index.js']
        },

        uglify: {
            options: {
                banner: '//     Underscore.js <%= pkg.version %>'+ '\n' +
                        '//     <%= pkg.url %>' + '\n' +
                        '//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.' + '\n' +
                        '//     Underscore may be freely distributed under the MIT license.'
            },

            src: {
                'underscore-min.js': ['underscore.js']
            }
        },

        qunit: {
            all: ['test/**/*.html']
        },

        docco: {
            annotated: {
                src: ['underscore.js'],
                options: {
                    output: 'docs/'
                }
            }
        },
        
        watch: {
            src: {
                files: ['underscore.js', 'test/*.js'],
                tasks: ['qunit', 'uglify']
            }
        },

    });
    
    // shortcut task to test
    grunt.registerTask('test', ['qunit']);

    // shortcut task to generate docs
    grunt.registerTask('docs', ['docco']);

    //Load the plugin that provides the "docco" task.
    grunt.loadNpmTasks('grunt-docco');

    //Load the plugin that provides the "qunit" task.
    grunt.loadNpmTasks('grunt-contrib-qunit');

    //Load the plugin that provides the "jshint" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    
    //Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    //Load the plugin that provides the "watch" task.
    grunt.loadNpmTasks('grunt-contrib-watch');


}