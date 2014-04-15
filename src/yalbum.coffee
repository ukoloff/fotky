#
# order: 102
#

klass = $.Yalbum = (@yuser, @def)->
  @id = def.id.split(':').reverse()[0]

klass.prototype =
  loadPhotos = ->
