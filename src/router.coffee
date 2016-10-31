routing = (albums)->
  title = document.title
  all = {}
  all[z.fullPath()] = z for z in albums

  history (hash)->
    if ''==hash
      document.title = title
      root.head.innerHTML = ''
      root.foot.innerHTML = ''
      thumbs albums
      return

    hash = hash.split /\/+/
    unless a = all[hash.slice(0, 2).join '/']
      location.hash = '#'
      return

    document.title = a.def.title
    root.head.innerHTML = tH a
    root.foot.innerHTML = tF a.def.summary

    img = hash.slice(2).join '/'

    fire = (oops)->
      a.loaded = true
      a.failed = true if oops
      if img
        picture img, a
      else if a.failed
        root.body.innerHTML = tOops
      else
        thumbs a.ymgs

    if a.loaded
      do fire
    else
      root.body.innerHTML = do tWait
      a.loadPhotos
        success: fire
        error: -> fire 1

tH = without (album)->
  a href: '#', 'Галереи'
  text ' / '
  b album.def.title
tH.id = 'aHead'

tF = without (txt)->
  i txt
tF.id = 'aFoot'

tWait = without ->
  div class: 'info', 'Идёт загрузка альбома...'

tWait.id = 'wait'

tOops = do without ->
  div class: 'error', 'Не удалось загрузить альбом :-('

module.exports = routing
