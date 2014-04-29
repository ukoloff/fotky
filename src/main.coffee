withOut = require 'without'
Yuser = require './yuser'
history = require './history'
root = require './root'

root.register Yuser

root.ready = (z)->
  root.div.innerHTML = t z

  history (hash)->
    console.log '#', hash

t = withOut.$compile (list, size = 'S')->
  for y in list
    yz = y.def.img[size]
    div class: 'thumbnail', ->
      a style: "width: #{yz.width}px;", href: "##{y.fullPath()}", title: y.def.title or null, ->
        img src: yz.href
        div -> b y.def.title
        div title: y.def.summary or null, -> small y.def.summary
  return

t.id = 'thumbs'
