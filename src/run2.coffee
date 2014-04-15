#
# order: 2000
#

u = new $.Yuser 'stanislav-ukolov',
  error: ->
    console.log 'Oops!'
  success: ->
    console.log 'User loaded: ', @
