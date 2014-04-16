#
# order: 102
#

klass = $.Yalbum = (yuser, @def)->
  @id = def.id.split(':').reverse()[0]
  @path = "#{yuser.id}/#{@id}"

klass.prototype =
  loadPhotos = ->
