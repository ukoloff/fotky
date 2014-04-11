http = require 'http'
url  = require 'url'
fs   = require 'fs'
cc   = require 'coffee-script'
idx  = require './index'
_    = require 'underscore'

module.exports = (options)->
  port = options.port
  port = 1234 unless /^\d{4,5}$/.test port

  http.createServer(server).listen port

  console.log "Point your browser to:"
  for k, v of require('os').networkInterfaces()
    for x in v when x.family=='IPv4'
      console.log " - http://#{x.address}:#{port}"

server = (req, rsp)->
  p = url.parse(req.url).pathname

  if /^\/(\w+)\.css$/.test p
    return doCSS rsp

  if /^\/(\w+)\.js$/.test p
    return doJS rsp, RegExp.$1

  doHTML rsp

scripts = {}

doHTML = (rsp)->
  rsp.writeHead 200, 'Content-Type': 'text/html; charset=utf-8'
  html = []
  fs.readFile __dirname+'/www.html', encoding: 'utf8', (err, data)->
    html = data.split /<#include>\s*/, 2
    rsp.write html[0]
    idx (files)->
      scripts = _.indexBy files, 'name'
      rsp.write "<script src='/#{f.name}.js'></script><!-- order: #{f.order} -->\n" for f in files
      rsp.write html[1]
      rsp.end()

doCSS = (rsp)->
  fs.readFile __dirname+'/www.css', (err, data)->
    rsp.writeHead 200, 'Content-Type': 'text/css'
    rsp.end data

doJS = (rsp, name)->
  do404 = ->
    rsp.writeHead 404, 'Content-Type': 'text/plain'
    rsp.end '// Not found'

  unless z = scripts[name]
    do do404
    return

  fs.readFile z.path, encoding: 'utf8', (err, data)->
    if err
      do do404
      return
    rsp.writeHead 200, 'Content-Type': 'application/javascript'
    if z.cs
      data = try cc.compile data
      catch e
        cc.compile """
          throw SyntaxError '''
          #{name}.coffee(#{e.location.first_line+1}:#{e.location.first_column+1}): #{e.message.replace /[\\']/g, '\\$&'}
          '''
        """, bare: true
    rsp.end data

