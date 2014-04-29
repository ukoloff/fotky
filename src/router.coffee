history = require './history'
root = require './root'
t = require './thumbs'

routing = (albums)->
  all = {}
  all[z.fullPath()] = z for z in albums

  history (hash)->
    if ''==hash
      root.div.innerHTML = t albums
      return

    hash = hash.split /\/+/
    unless a = all[hash.slice(0, 2).join '/']
      location.hash = '#'
      return

    img = hash.slice(2).join '/'

    fire = ->
      if img
        console.log a.fullPath(), img
      else
        root.div.innerHTML = t a.ymgs

    if a.loaded
      do fire
    else
      a.loadPhotos
        success: ->
          a.loaded = true
          do fire
        error: ->
          a.loaded = true
          a.failed = true
          do fire

module.exports = routing
