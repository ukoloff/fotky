#
# order: 20
#

$.jsonp = (options)->

  {url, callback}=options
  callback ||= 'callback'

  cbname = setCallback (data)->
    resetCallback cbname
    options.success? data

  js = document.createElement 'script'
  js.async = true
  js.src = "#{url}#{if url.indexOf('?')>=0 then '&' else '?'}#{callback}=#{cbname}"
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild js

setCallback = (fn)->
  while @[name = "_#{random 15}"]
    ;
  @[name] = fn
  name

resetCallback = (name)->
  delete @[name]

random=(q=1)->
  s = ''
  while s.length<q
    n=Math.floor 62*Math.random()
    s+=String.fromCharCode n%26+'Aa0'.charCodeAt n/26
  s
