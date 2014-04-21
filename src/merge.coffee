merge = ->
  r = {}
  for x in arguments
    for k, v of x
      r[k] = v
  r

module.exports = merge
