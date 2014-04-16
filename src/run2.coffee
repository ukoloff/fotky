#
# order: 2000
#

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

