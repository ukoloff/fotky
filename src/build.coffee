browserify = require 'browserify'

opaque = require './opaque'
c2js = require './coffee2js'
bundler = require './bundler'

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
        console.log 'Done!'
      files.forEach (file)->
        listen.push listenFile file
  .pipe bundler 'fotky', true

listenFile = (file)->
  chokidar.watch file,
    persistent: true
    ignoreInitial: true
  .on 'all', (e, f)->
    listen.forEach (z)->z.close()
    listen = []
    console.log new Date().toLocaleTimeString(), "Fired #{e} on #{f}..."
    process.nextTick build
