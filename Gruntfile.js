
var path = require('path');

module.exports = function( grunt ) {

  require("matchdep").filterDev("grunt-*").forEach( grunt.loadNpmTasks );

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: '<%= pkg.main %>.js',
        dest: '<%= pkg.main %>.min.js'
      }
    },
    express: {
      server: {
        options: {
          bases: 'public'
        }   
      }   
    },
    open: { 
      server:{
        path: "http://localhost:<%= express.server.options.port %>/index.html"
      }
    }
  });
   
   
  grunt.registerTask('build', ['uglify']);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('server', ['express','open','express-keepalive']);

}
