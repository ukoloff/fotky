#
# order: 1000
#

defer = (fn)-> setTimeout fn, 0

defer ->
  do $.startHistory
  $.jsonp
    url: 'http://api-fotki.yandex.ru/api/users/stanislav-ukolov/album/417370/?format=json'
    success: (data)->
      console.log 'Album', data
      $.jsonp
       url: data.links.photos
       success: thumbs

  return

  defer ->
    $.jsonp
      url: 'http://api-fotki.yandex.ru/api/users/stanislav-ukolov/?format=json'
      success: (data)->
        console.log 'User', data
        $.jsonp
         url: data.collections['album-list'].href+'?format=json'
         success: (data)->
           console.log 'Albums', data


thumbs = (album)->
  console.log 'Photos', album
  document.getElementById('fotky').innerHTML = t album

t = withOut.$compile (album, size = 'S')->
  for x in @entries
    xz = x.img[size]
    div class: 'thumbnail', ->
      a style: "width: #{xz.width}px;", href: "##{x.id}", ->
        img src: xz.href
        div x.title
        div x.summary
  return
