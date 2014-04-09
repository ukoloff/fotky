http = require 'http'
url  = require 'url'
fs   = require 'fs'
cc   = require 'coffee-script'
idx  = require './index'

module.exports = (options)->
  port = options.port
  port = 1234 unless /^\d{4,5}$/.test port

  http.createServer(server).listen port

  console.log "Point your browser to:"
  for k, v of require('os').networkInterfaces()
    for x in v when x.family=='IPv4'
      console.log " - http://#{x.address}:#{port}"

server = (req, rsp)->
  doHTML rsp

doHTML = (rsp)->
  rsp.writeHead 200, 'Content-Type': 'text/html; charset=utf-8'
  html = []
  fs.readFile __dirname+'/www.html', encoding: 'utf8', (err, data)->
    html = data.split /<#include>\s*/, 2
    rsp.write html[0]
    idx (files)->
      rsp.write "<script src='/#{f.name}.js'></script>\n" for f in files
      rsp.write html[1]
      rsp.end()
