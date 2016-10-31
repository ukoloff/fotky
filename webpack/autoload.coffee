fs = require 'fs'
path = require 'path'
ini = require '../package'

exports[f] = f for f of ini.devDependencies

fs.readdirSync folder = path.join __dirname, '../src'
.forEach (src)->
  exports[path.parse(src).name] = path.join folder, src
