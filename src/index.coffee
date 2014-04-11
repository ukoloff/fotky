fs = require 'fs'
p  = require 'path'
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
        order: Number k
        path: v
        cs: /\.coffee$/i.test v
      do listFiles

  listFiles = ->
    fs.readdir __dirname, (err, files)->
      if err
        do Finish
      else
        findOrder files

  findOrder = (files)->
    while files.length
      continue unless cs=/\.(?:js|(coffee))$/.exec f = files.shift()
      cs = !!cs[1]
      fs.readFile path = __dirname+'/'+f, encoding: 'utf-8', (err, data)->
        if err
          findOrder files
          return
        cmt = if cs then '#' else '//'
        if match = ///^(?:#{cmt}.*?(?:\r\n?|\n))*?#{cmt}\s*order:\s*(\d+)\s*(?:\r\n?|\n)///.exec data
          res.push
            order: Number match[1]
            path: path
            cs: cs
        findOrder files
      return
    do Finish

  Finish = ->
    res = _.sortBy res, 'order'
    _.each res, (z)->
      z.path = p.resolve z.path
      z.name = p.basename(z.path).replace /\.[^.]*$/, ''
    callback ? res

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
