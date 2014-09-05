jsonp = require './jsonp'

Guser = (@name, options)->
  jsonp
    url: "https://picasaweb.google.com/data/feed/api/user/#{escape(name)}/"
    data: alt: 'json'
    error: =>
      options.error?.call @
    success: (data)=>
      # console.log data
      @id = data.feed.author[0].uri.$t.replace /.*\W/, ''
      @yalbums = []
      options.success?.call @

Guser.exts = 'g google google.com gmail.com'.split ' '

module.exports = Guser
