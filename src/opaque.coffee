through = require 'through'
intreq = require 'intreq'
bp = require 'browser-pack'

module.exports = ->
  r = intreq()
  r .pipe(bp raw: true)
    .pipe through ((b)-> x.queue b), (-> x.queue null)
  x = through ((b)->r.write(b)), (-> r.end())
