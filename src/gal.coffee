jsonp = require './jsonp'

Gal = (guser, @def)->
  @path = guser.id
  @id = @def.id.$t.replace(/\?.*/, '').replace /.*\W/, ''

Gal.prototype =
  visible: ->
    true

  loadPhotos: (options)->
    options.error?.call @

  fullPath: ->
    "#{@path}/#{@id}"

module.exports = Gal
