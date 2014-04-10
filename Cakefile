require 'coffee-script/register'

option '-p', '--port [Number]', 'port to run Webserver on'

task 'www', 'Run development Webserver', (options)->
  require('./src/www') options

task 'build', 'Compile, minify and link', ->
  require './src/build'
