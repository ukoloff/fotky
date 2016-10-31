root = require './root'

thumbs = (list)->
  w = root.size()
  root.body.innerHTML = t list, w.w/Math.max 3, Math.sqrt list.length

t = without (list, size)->
  for y in list
    thumb = 0
    for k, v of y.def.img
      w1 = Math.max v.width, v.height
      if !thumb or w0 < w1 <= size or w0 > w1 >= size or w1 <= size < w0
        thumb = v
        w0 = w1
    name = y.def.title
    name = y.def.summary if /^[-\w]{8,}[.]\w{3}$/.test name
    name ||= null
    span class: 'thumbnail', ->
      a style: "width: #{thumb.width}px;", href: "##{y.fullPath()}", title: name, ->
        img src: thumb.href, alt: name
        div -> b name
        div title: y.def.summary or null, -> small y.def.summary
  return

t.id = 'thumbs'

module.exports = thumbs
