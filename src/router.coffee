history = require './history'
root = require './root'
t = require './thumbs'
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
    root.head.innerHTML = tHead a.def.title
    root.foot.innerHTML = tFoot a.def.summary

    img = hash.slice(2).join '/'

    renderAlbum = ->
      root.body.innerHTML = if a.failed
        do tOops
      else
        t a.ymgs

    renderImg = ->
      if a.failed or not z = findImg a, img
        location.hash = '#'+a.fullPath()
        return
      document.title = z.def.title
      root.head.innerHTML = tHead z.def.title
      root.body.innerHTML = ti z
      root.foot.innerHTML = tFoot z.def.summary

    fire = (oops)->
      a.loaded = true
      a.failed = true if oops
      do if img
        renderImg
      else
        renderAlbum

    if a.loaded
      do fire
    else
      root.body.innerHTML = do tWait
      a.loadPhotos
        success: fire
        error: -> fire 1

ti = withOut.$compile (z)->
  img src: z.def.img.L.href

ti.id = 'img'

tHead = withOut.$compile (txt)->
  b txt

tFoot = withOut.$compile (txt)->
  i txt

tFoot.id = 'footer'

findImg = (a, i)->
  return z for z in a.ymgs when z.id==i

tWait = withOut.compile ->
  div class: 'info', 'Идёт загрузка альбома...'

tWait.id = 'wait'

tOops = withOut.compile ->
  div class: 'error', 'Не удалось загрузить альбом :-('

tOops.id = 'oops'

module.exports = routing
