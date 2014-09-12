Ymg = (yalbum, @def)->
  @id = def.id.split(':').reverse()[0]
  @path = yalbum.fullPath()

Ymg.prototype =
  fullPath: ->
    "#{@path}/#{@id}"

module.exports = Ymg
