idx = require './index'
fs = require 'fs'
coffee = require 'coffee-script'
uglify = require 'uglify-js'

idx (files)->
  fs.writeFileSync out = __dirname+'/../fotky.js', ''
  for f in files
    console.log 'Compiling: ', f.name
    src = fs.readFileSync f.path,
      encoding: 'utf-8'
    try
      src = coffee.compile src
    catch e
      console.log "# #{f.name}(#{e.location.first_line+1}:#{e.location.first_column+1}): #{e.message}"
      src=''
    fs.appendFileSync out = __dirname+'/../fotky.js',
      uglify.minify(src, fromString: true).code+'\n'
