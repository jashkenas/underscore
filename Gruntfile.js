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
    
    grunt.registerTask('test', ['qunit']);

    grunt.registerTask('docs', ['docco']);

    grunt.loadNpmTasks('grunt-docco');

    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-watch');


}