withOut = require 'without'

t = withOut.$compile (list, size = 'S')->
  for y in list
    yz = y.def.img[size]
    span class: 'thumbnail', ->
      a style: "width: #{yz.width}px;", href: "##{y.fullPath()}", title: y.def.title or null, ->
        img src: yz.href, alt: y.def.title
        div -> b y.def.title
        div title: y.def.summary or null, -> small y.def.summary
  return

t.id = 'thumbs'

module.exports = t
