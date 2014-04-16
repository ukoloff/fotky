#
# order: 103
#

$.Ymg = (yalbum, @def)->
  @id = def.id.split(':').reverse()[0]
  @path = "#{yalbum.path}/#{@id}"
