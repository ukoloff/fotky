jsonp = require './jsonp'

Gal = (guser, def)->
  @path = guser.id
  @id = def.gphoto$id.$t
  @def =
    title: def.title.$t
    summary: def.summary.$t
  false

Gal.prototype =
  visible: ->
    true

  loadPhotos: (options)->
    options.error?.call @

  fullPath: ->
    "#{@path}/#{@id}"

module.exports = Gal
