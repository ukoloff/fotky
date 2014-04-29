history = require './history'
root = require './root'
t = require './thumbs'

routing = (albums)->

  root.div.innerHTML = t albums

  history (hash)->
    console.log '#', hash

module.exports = routing
