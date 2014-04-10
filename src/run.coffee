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
       success: (data)->
         console.log 'Photos', data

