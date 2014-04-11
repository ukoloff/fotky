fs = require 'fs'
y  = require 'js-yaml'
_  = require 'underscore'

module.exports = (callback)->

  res = []

  readYAML = ->
    fs.readFile __dirname+'/index.yaml', encoding: 'utf-8', (err, data)->
      return do listFiles if err
      try
        list = y.safeLoad data
      catch e
        return do listFiles
      res = _.map list, (v, k)->
        order: k
        path: v
        cs: /\.coffee$/i.test v
      do listFiles

  listFiles = ->
    console.log res

  do readYAML

  return
  fs.readdir __dirname, (err, files)->
    return if err
    X = []
    do click = ->
      loop
        unless file = files.shift()
          files.sort (a, b)->
            a = a.order
            b = b.order
            if a==b then 0
            else if a<b then -1
            else +1
          callback X
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
