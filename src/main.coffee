Yuser = require './yuser.coffee'

u = new Yuser 'stanislav-ukolov',
  success: ->
    console.log @
