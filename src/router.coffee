history = require './history'
root = require './root'
t = require './thumbs'
picture = require './picture'
withOut = require 'without'

routing = (albums)->
  title = document.title
  all = {}
  all[z.fullPath()] = z for z in albums

  history (hash)->
    if ''==hash
      document.title = title
      root.body.innerHTML = t albums
      root.head.innerHTML = ''
      root.foot.innerHTML = ''
      return

    hash = hash.split /\/+/
    unless a = all[hash.slice(0, 2).join '/']
      location.hash = '#'
      return

    document.title = a.def.title
    root.head.innerHTML = tH a.def.title
    root.foot.innerHTML = tF a.def.summary

    img = hash.slice(2).join '/'

    fire = (oops)->
      a.loaded = true
      a.failed = true if oops
      if img
        picture img, a
      else
        root.body.innerHTML = if a.failed
          tOops
        else
          t a.ymgs

    if a.loaded
      do fire
    else
      root.body.innerHTML = do tWait
      a.loadPhotos
        success: fire
        error: -> fire 1

tH = withOut.$compile (txt)->
  b txt
tH.id = 'aHead'

tF = withOut.$compile (txt)->
  i txt
tF.id = 'aFoot'

tWait = withOut.compile ->
  div class: 'info', 'Идёт загрузка альбома...'

tWait.id = 'wait'

tOops = do withOut.compile ->
  div class: 'error', 'Не удалось загрузить альбом :-('

module.exports = routing
