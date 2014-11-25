
var path = require('path');

module.exports = function( grunt ) {

  require("matchdep").filterDev("grunt-*").forEach( grunt.loadNpmTasks );

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    src:"public/src",
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> | Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %> | <%= pkg.license %> license */\n'
      },
      build: {
        src: '<%= pkg.main %>.js',
        dest: '<%= pkg.main %>.min.js'
      }
    },
    express: {
      server: {
        options: {
          bases: ['public','bower_components']
        }   
      }   
    },
    concat: {
      dist:{
        src:['<%= src %>/intro.js',
             '<%= src %>/app.js',
             '<%= src %>/Overlay.js',
             '<%= src %>/ngImageEditor.js',
             '<%= src %>/outro.js'],
        dest:'dist/ngImageEditor.js'
      }
    },
    open: { 
      server:{
        path: "http://localhost:<%= express.server.options.port %>/index.html"
      }
    }
  });
   
   
  grunt.registerTask('build', ['concat','uglify']);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('server', ['express','open','express-keepalive']);

}
