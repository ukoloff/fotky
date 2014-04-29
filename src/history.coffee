
startHistory = (fn)->
  prev = null

  checkHash = ->
    hash = /#(.*)|$/.exec(location.href)[1] or ''
    return if prev==hash
    prev = hash
    fn? hash

  if 'onhashchange' of window
    window.onhashchange = checkHash
  else
    window.setInterval checkHash, 50

  do checkHash

module.exports = startHistory
