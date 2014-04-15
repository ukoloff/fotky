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
    error: ->
      console.log 'Oops!'

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
      a style: "width: #{xz.width}px;", href: "##{x.id}", title: x.title or null, ->
        img src: xz.href
        div -> b x.title
        div title: x.summary or null, -> small x.summary
  return
