through = require 'through'
uglify = require 'uglify-js'
path = require 'path'
fs = require 'fs'

bundler = (name, map)->
  min = fs.createWriteStream path.resolve __dirname, '..', name+'.js'
  out = fs.createWriteStream path.resolve __dirname, '..', 'test', name+'.js'
  if map
    out = wrapMap out, path.resolve __dirname, '..', 'test', name+'.map'

  data = ''

  write = (buf)->
    out.write buf
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

wrapMap = (stream, file)->
  exorcist = require 'exorcist'
  z = exorcist file
  z.pipe stream
  z

module.exports = bundler
