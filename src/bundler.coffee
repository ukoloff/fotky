through = require 'through'
uglify = require 'uglify-js'
path = require 'path'
fs = require 'fs'

bundler = (name)->
  out = fs.createWriteStream path.resolve __dirname, '..', 'test', name+'.js'
  min = fs.createWriteStream path.resolve __dirname, '..', name+'.js'
  data = ''

  write = (buf)->
    out.write data
    data+=buf

  end = ->
    out.end()
    min.end minify data

  through write, end

minify = (s)->
  try
    uglify.minify(s, fromString: true).code
  catch e
    "// Minify (syntax?) error"

module.exports = bundler
