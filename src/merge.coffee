merge = ->
  r = {}
  for x in arguments when x?
    for k, v of x
      r[k] = v
  r

module.exports = merge
