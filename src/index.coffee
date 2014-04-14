fs = require 'fs'
p  = require 'path'
y  = require 'js-yaml'
_  = require 'underscore'

getExt = (filename)->
  switch p.extname(filename).toLowerCase()
    when '.js'     then 0
    when '.coffee' then 1

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
        cs: getExt v
      do listFiles

  listFiles = ->
    fs.readdir __dirname, (err, files)->
      if err
        do Finish
      else
        findOrder files

  findOrder = (files)->
    while files.length
      continue unless cs=getExt(f = files.shift())?
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
      z.path = p.resolve __dirname, z.path
      z.name = p.basename(z.path).replace /\.[^.]*$/, ''
    callback? res

  do readYAML
