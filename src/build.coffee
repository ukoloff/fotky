browserify = require 'browserify'
fs = require 'fs'

do build = ->
  b = new browserify
    extension: ['.coffee']

  b.transform './src/coffee2js'

  b.add './src/main.coffee'

  b.bundle
    debug: true
    (err, data)->
      if err
        console.log "#Error:", err
      else
        fs.writeFile 'test/fotky.js', data
