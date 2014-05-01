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
      return

    hash = hash.split /\/+/
    unless a = all[hash.slice(0, 2).join '/']
      location.hash = '#'
      return

    document.title = a.def.title

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
      root.body.innerHTML = ti z

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
  div -> b z.def.title
  div -> small z.def.summary

findImg = (a, i)->
  return z for z in a.ymgs when z.id==i

tWait = withOut.compile ->
  div class: 'info', 'Идёт загрузка альбома...'

tOops = withOut.compile ->
  div class: 'error', 'Не удалось загрузить альбом :-('

module.exports = routing
