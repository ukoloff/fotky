#
# order: 101
#

$.Yuser = (@name, options)->
  $.jsonp
    url: "http://api-fotki.yandex.ru/api/users/#{escape(name)}/?format=json"
    error: =>
      options.error?.call @
    success: (data)=>
      @service = data
      $.jsonp
        url: data.collections['album-list'].href+'?format=json'
        error: =>
          options.error?.call @
        success: (data)=>
          @albums = data
          options.success?.call @
