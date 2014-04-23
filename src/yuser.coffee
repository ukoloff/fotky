Yalbum = require './yalbum.coffee'
jsonp = require './jsonp.coffee'

Yuser = (@name, options)->
  jsonp
    url: "http://api-fotki.yandex.ru/api/users/#{escape(name)}/"
    data:
      format: 'json'
    error: =>
      options.error?.call @
    success: (data)=>
      @service = data
      jsonp
        url: data.collections['album-list'].href+'?format=json'
        error: =>
          options.error?.call @
        success: (data)=>
          @albums = data
          do findId
          @yalbums = do makeYalbums
          options.success?.call @

  findId = =>
    for a in @albums.authors when a.name==@name
      return @id = a.uid

  makeYalbums = =>
    for a in @albums.entries
      new Yalbum @, a

module.exports = Yuser
