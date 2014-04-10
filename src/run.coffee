#
# order: 1000
#

defer = (fn)-> setTimeout fn, 0

defer ->
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
  for x in album.entries
    div = document.createElement 'div'
    div.className = 'thumbnail'
    img = document.createElement 'img'
    img.src = x.img.S.href
    div.appendChild img
    document.body.appendChild div
  false
