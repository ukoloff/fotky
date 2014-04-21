withOut = require 'without'

prev = null

checkHash = ->
  hash = /#(.*)|$/.exec(location.href)[1] or ''
  return if prev==hash
  prev = hash

  document.getElementById('hash').innerHTML = t hash

t = withOut.$compile ->
  b 'Hash: '
  text @

startHistory = ->
  do checkHash
  if 'onhashchange' of window
    window.onhashchange = checkHash
  else
    window.setInterval checkHash, 50

module.exports = startHistory
