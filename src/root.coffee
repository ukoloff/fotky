merge = require './merge'

loaders = []
domains = {}

setTimeout =>
  return unless exports.div = z = document.getElementById 'fotky'
  return unless script = z.getElementsByTagName('script')[0]

  exports.albums = parse script.innerHTML
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

# Parse albums' names
parse = (ids)->
  re = ///
    [*] | # Either '*'
    (?:
      ([-\w]+) # Or identifier
      (?: @ ( [-\w]+ (?:[.][-\w]+)? ) )? # with optional @domain
    )///g
  while m = re.exec ids
    if m[2]
      user =
        u: m[1]
        d: domains[m[2]]
      user = null unless user.d?
      stars = 0
      continue
    continue unless user
    if '*'==m[0]
      continue if stars++
    merge
      id: m[0]
      user
      if stars & 1 and '*'!=m[0] then off: 1 else {}
