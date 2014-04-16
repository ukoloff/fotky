#
# order: 102
#

klass = $.Yalbum = (yuser, @def)->
  @id = def.id.split(':').reverse()[0]
  @path = yuser.id

klass.prototype =
  loadPhotos: ->
    $.jsonp
      url: @def.links.photos
      success: (data)=>
        @ymgs = for y in (@photos = data).entries
          new $.Ymg @, y

  fullPath: ->
    "#{@path}/#{@id}"
