fs = require 'fs'

unless GLOBAL.listCallback
  throw Error 'listCallback not defined'

list = (files)->
  files.sort (a, b)->
    a = a.order
    b = b.order
    if a==b then 0
    else if a<b then -1
    else +1
  @listCallback files

fs.readdir __dirname, (err, files)->
  return if err
  X = []
  do click = ->
    loop
      return list X unless file = files.shift()
      break if file.match /(.*)\.coffee$/i
    name = RegExp.$1
    fs.readFile fullname = __dirname+'/'+file, encoding: 'utf-8', (err, data)->
      if !err and data.match /^(?:#.*?(?:\r\n?|\n))*?#\s*order:\s*(\d+)\s*(?:\r\n?|\n)/
        X.push
          path: fullname
          name: name
          order: Number RegExp.$1
      do click
