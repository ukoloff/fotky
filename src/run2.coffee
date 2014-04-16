#
# order: 2000
#

defer = (fn)-> setTimeout fn, 0

defer ->
  do $.startHistory

  u = new $.Yuser 'stanislav-ukolov',
    error: ->
      console.log 'Oops!'
    success: ->
      console.log 'User loaded: ', @
      for y in @yalbums
        if y.id=="417370"
          break
        else
          y = null
      unless y
        console.log 'Oops!!'
        return
      y.loadPhotos
        error: ->
          console.log 'Oops!!!'
        success: ->
          render @

render = (yalbum)->
  console.log 'Yalbum', yalbum
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
