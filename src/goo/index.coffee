jsonp = require '../jsonp'
Gal = require './gal'

Guser = (@name, options)->
  jsonp
    url: "https://picasaweb.google.com/data/feed/api/user/#{escape(name)}/"
    data: alt: 'json'
    error: =>
      options.error?.call @
    success: (data)=>
      console.log data
      @id = data.feed.gphoto$user.$t
      @yalbums = makeGals data.feed.entry
      options.success?.call @

  makeGals = (entry)=>
    new Gal @, z for z in entry

Guser.exts = 'g google google.com gmail.com'.split ' '

module.exports = Guser
