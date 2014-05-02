root = require './root'
withOut = require 'without'

thumbs = (list)->
  w = root.size()
  root.body.innerHTML = t list, Math.min(w.w, w.h)/Math.max 3, Math.sqrt list.length

t = withOut.$compile (list, size)->
  for y in list
    thumb = 0
    for k, v of y.def.img
      w1 = Math.max v.width, v.height
      if !thumb or w0 < w1 < size or w0 > w1 > size
        thumb = v
        w0 = w1
    span class: 'thumbnail', ->
      a style: "width: #{thumb.width}px;", href: "##{y.fullPath()}", title: y.def.title or null, ->
        img src: thumb.href, alt: y.def.title
        div -> b y.def.title
        div title: y.def.summary or null, -> small y.def.summary
  return

t.id = 'thumbs'

module.exports = thumbs
