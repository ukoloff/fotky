merge = require './merge'

loaders = []
domains = {}

setTimeout =>
  return unless exports.div = z = document.getElementById 'fotky'
  return unless script = z.getElementsByTagName('script')[0]
  script = script.innerHTML

  # Parse albums' names

  re = ///
    [*] | # Either '*'
    (?:
      [-\w]+ # Or identifier
      (?: @ ( [-\w]+ (?:[.][-\w]+)? ) )? # with optional @domain
    )///g
  exports.albums = while m = re.exec script
    if m[1]
      user = m[0]
      stars = 0
      continue
    continue unless user
    if '*'==m[0]
      continue if stars++
    merge
      user: user
      album: m[0]
      if stars & 1 and '*'!=m[0] then off: 1 else {}

  exports.onparse?.call exports

flatten = (array)->
  r = []
  for _, x of array
    if 'object'==typeof x
      r.push.apply r, flatten x
    else
      r.push x
  r

exports.register = ->
  for z, i in loaders = flatten [].slice.call arguments
    domains[x]=i for x in z.exts or []
  return
