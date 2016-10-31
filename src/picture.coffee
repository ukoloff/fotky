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
  (b = root.body).innerHTML = ''
  root.foot.innerHTML = tF z.def.summary
  b.innerHTML = t z, root.size()
  b.firstChild.onload = ->
    root.head.scrollIntoView()

t = without (z, size)->
  size.w = 1 if size.w < 1
  size.h = 1 if size.h < 1
  thumb = null
  for k, x of z.def.img
    factor = Math.abs Math.log if x.width*size.h>x.height*size.w then x.width/size.w else x.height/size.h
    if !thumb or factor<f0
      thumb = x
      f0 = factor
  img
    src: thumb.href
    alt: z.def.title
    title: z.def.title
    style: "max-height: #{size.h}px; max-width: #{size.w}px;"

t.id = 'img'

tH = without (img, album)->
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

tF = without.$compile (txt)->
  i txt
tF.id = 'iFoot'

module.exports = picture
