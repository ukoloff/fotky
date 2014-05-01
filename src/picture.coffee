root = require './root'
withOut = require 'without'

picture = (img, album)->
  find = ->
    for z, i in album.ymgs when z.id==img
      z.idx = Number i
      return z

  if album.failed or !z = do find
    location.hash = '#'+album.fullPath()
    return

  document.title = z.def.title
  root.head.innerHTML = tH z, album
  root.body.innerHTML = t z
  root.foot.innerHTML = tF z.def.summary

t = withOut.$compile (z)->
  img src: z.def.img.L.href

t.id = 'img'

tH = withOut.$compile (img, album)->
  a
    class: 'left'
    href: '#'+(album.ymgs[img.idx-1]or album).fullPath()
    title: 'Назад'
    '<<'
  a href: '#', 'Галереи'
  text ' / '
  a href: '#'+album.fullPath(), album.def.title
  text ' / '
  b img.def.title
  a
    class: 'right'
    href: '#'+(album.ymgs[img.idx+1]or album).fullPath()
    title: 'Вперёд'
    '>>'

tH.id = 'iHead'

tF = withOut.$compile (txt)->
  i txt
tF.id = 'iFoot'

module.exports = picture
