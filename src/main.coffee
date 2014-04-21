require './jsonp.coffee'
withOut = require 'without'

console.log do withOut.compile ->
  div id: 1
