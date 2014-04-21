withOut = require 'without'
Yuser = require './yuser.coffee'
history = require './history.coffee'

setTimeout history

u = new Yuser 'stanislav-ukolov',
  error: ->
    console.log 'User not found!'
  success: ->
    for a in @yalbums
      if a.def.img
        load a
        return
    console.log 'No albums found'

load = (a)->
  a.loadPhotos
    error: ->
      console.log 'Oops'
    success: ->
      render @

render = (yalbum)->
  document.getElementById('fotky').innerHTML = t yalbum.ymgs

t = withOut.$compile (list, size = 'S')->
  for y in list
    yz = y.def.img[size]
    div class: 'thumbnail', ->
      a style: "width: #{yz.width}px;", href: "##{y.fullPath()}", title: y.def.title or null, ->
        img src: yz.href
        div -> b y.def.title
        div title: y.def.summary or null, -> small y.def.summary
  return
