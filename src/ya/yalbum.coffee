Ymg = require './ymg'

Yalbum = (yuser, @def)->
  @id = @def.id.split(':').reverse()[0]
  @path = yuser.id

Yalbum.prototype =
  loadPhotos: (options)->
    return unless @visible()
    entries = []
    do batch = (url=@def.links.photos)=>
      jsonp
        url: url
        error: =>
          options.error?.call @
        success: (data)=>
          entries.push.apply entries, data.entries if data?.entries
          return batch data.links.next if data?.links?.next
          @ymgs = for y in entries
            new Ymg @, y
          options.success?.call @

  fullPath: ->
    "#{@path}/#{@id}"

  visible: ->
    @def.img?

module.exports = Yalbum
