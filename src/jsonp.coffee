#
# order: 20
#

$.jsonp = (options)->

  {url, callback}=options
  callback ||= 'callback'

  cbname = setCallback (data)->
    resetCallback cbname
    console.log data

  js = document.createElement 'script'
  js.async = true
  js.src = "#{url}#{if url.indexOf('?')>=0 then '&' else '?'}#{callback}=#{cbname}"
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild js

setCallback = (fn)->
  while @[name = "_#{String.random 15}"]
    ;
  @[name] = fn
  name

resetCallback = (name)->
  delete @[name]
