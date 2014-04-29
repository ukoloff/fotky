Yuser = require './yuser'
history = require './history'
root = require './root'
t = require './thumbs'

root.register Yuser

root.ready = (z)->
  root.div.innerHTML = t z

  history (hash)->
    console.log '#', hash
