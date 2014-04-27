browserify = require 'browserify'
chokidar = require 'chokidar'
uglify = require 'uglify-js'
fs = require 'fs'
opaque = require './opaque'
c2js = require './coffee2js'

listen = []

module.exports = build = (watch)->
  console.log 'Rebuilding...'
  listen.forEach (z)->z.close()
  listen = []
  files = []

  b = new browserify
    extensions: ['.coffee']
    pack: opaque

  b.transform c2js

  b.add './src/main'

  if watch
    b.on 'file', (f)-> files.push f

  b.bundle
    debug: true
    (err, data)->
      if err
        console.log "#Error:", err
      else
        fs.writeFile __dirname+'/../test/fotky.js', data
        fs.writeFile __dirname+'/../fotky.js', minify data
        console.log 'Build done!'
      files.forEach (file)->
        listen.push listenFile file

minify = (s)->
  try
    uglify.minify(s, fromString: true).code
  catch e
    "// Minify (syntax?) error"

listenFile = (file)->
  chokidar.watch file,
    persistent: true
    ignoreInitial: true
  .on 'all', (e, f)->
    console.log new Date().toLocaleTimeString(), "Fired #{e} on #{f}..."
    build true
