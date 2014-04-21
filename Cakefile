require 'coffee-script/register'

build = require './src/build'

task 'test', 'Start browserify rebuild loop', ->
  build true

task 'build', 'Compile, minify and link', ->
  do build
