Ymg = require './ymg'
jsonp = require '../jsonp'

Yalbum = (yuser, @def)->
  @id = def.id.split(':').reverse()[0]
  @path = yuser.id

Yalbum.prototype =
  loadPhotos: (options)->
    return unless @visible()
    jsonp
      url: @def.links.photos
      success: (data)=>
        @ymgs = for y in (@photos = data).entries
          new Ymg @, y
        options.success?.call @
      error: =>
        options.error?.call @

  fullPath: ->
    "#{@path}/#{@id}"

  visible: ->
    @def.img?

module.exports = Yalbum
