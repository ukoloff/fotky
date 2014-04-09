http = require 'http'
url  = require 'url'
fs   = require 'fs'
cc   = require 'coffee-script'

module.exports = (options)->
  port = options.port
  port = 1234 unless /^\d{4,5}$/.test port

  console.log "Point your browser to:"
  for k, v of require('os').networkInterfaces()
    for x in v when x.family=='IPv4'
      console.log " - http://#{x.address}:#{port}"
