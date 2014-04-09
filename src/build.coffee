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
    fs.appendFileSync out = __dirname+'/../fotky.js',
      uglify.minify(coffee.compile(src), fromString: true).code+'\n'
