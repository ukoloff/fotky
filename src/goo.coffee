jsonp = require './jsonp'

Guser = (@name, options)->
  options.error?.call 0

Guser.exts = 'g google google.com gmail.com'.split ' '

module.exports = Guser
