fs = require 'fs'

fs.readdir __dirname, (err, files)->
  return if err
  X = []
  do click = ->
    loop
      unless file = files.shift()
        console.log X
        return
      break if file.match /(.*)\.coffee$/i
    name = RegExp.$1
    fs.readFile fullname = __dirname+'/'+file, encoding: 'utf-8', (err, data)->
      if !err and data.match /^(?:#.*?(?:\r\n?|\n))*?#\s*order:\s*(\d+)\s*(?:\r\n?|\n)/
        X.push
          path: fullname
          name: name
          order: Number RegExp.$1
      do click
