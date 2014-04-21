browserify = require 'browserify'
uglify = require 'uglify-js'
fs = require 'fs'
opaque = require './opaque'

module.exports = build = (watch)->
  watch = require 'chokidar' if watch
  b = new browserify
    extension: ['.coffee']
    pack: opaque

  b.transform './src/coffee2js'

  b.add './src/main.coffee'

  b.bundle
    debug: true
    (err, data)->
      if err
        console.log "#Error:", err
      else
        fs.writeFile 'test/fotky.js', data
        fs.writeFile 'fotky.js', minify data

minify = (s)->
  try
    uglify.minify(s, fromString: true).code
  catch e
    "// Minify (syntax?) error"
