#
# order: 103
#

klass = $.Ymg = (yalbum, @def)->
  @id = def.id.split(':').reverse()[0]
  @path = yalbum.fullPath()

klass.prototype =
  fullPath: ->
    "#{@path}/#{@id}"
