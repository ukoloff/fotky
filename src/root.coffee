merge = require './merge'

setTimeout =>
  return unless @div = z = document.getElementById 'fotky'
  return unless script = z.getElementsByTagName('script')[0]
  script = script.innerHTML

  # Parse albums' names

  re = ///
    [*] | # Either '*'
    (?:
      [-\w]+ # Or identifier
      (?: @ ( [-\w]+ (?:[.][-\w]+)? ) )? # with optional @domain
    )///g
  @albums = while m = re.exec script
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

  @onparse?.call @
