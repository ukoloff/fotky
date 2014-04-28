browserify = require 'browserify'
uglify = require 'uglify-js'
fs = require 'fs'

opaque = require './opaque'
c2js = require './coffee2js'

chokidar = require 'chokidar' if watch = !process.env.npm_config_once

listen = []

do build = ->
  console.log 'Rebuilding...'
  files = []

  b = new browserify
    extensions: ['.coffee']
    pack: opaque
  .transform c2js
  .add './src/main'

  if watch
    b.on 'file', (f)-> files.push f

  b.bundle
    debug: true
    (err, data)->
      if err
        console.log "#Error:", err
      else
        fs.writeFile __dirname+'/../test/fotky.js', data
        console.log 'Minifying...'
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
    listen.forEach (z)->z.close()
    listen = []
    console.log new Date().toLocaleTimeString(), "Fired #{e} on #{f}..."
    process.nextTick build
