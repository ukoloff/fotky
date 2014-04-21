merge = require './merge.coffee'

jsonp = (options)->
  {url, callback, timeout} = merge jsonp.defaults, options

  while window[cbname = "_#{random 15}"]
    ;

  window[cbname] = (data)->
    do Clear
    options.success? data
  Error = ->
    do Clear
    options.error?()

  js = document.createElement 'script'
  js.async = true
  js.onerror = Error
  js.src = "#{url}#{if url.indexOf('?')>=0 then '&' else '?'}#{callback}=#{cbname}"
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild js
  h = setTimeout Error, timeout

  Clear = ->
    delete window[cbname]
    clearTimeout h
    js.onerror = null
    js.parentNode.removeChild js
    js = null

  return

jsonp.defaults =
  callback: 'callback'
  timeout: 3000

random=(q=1)->
  s = ''
  while s.length<q
    n=Math.floor 62*Math.random()
    s+=String.fromCharCode n%26+'Aa0'.charCodeAt n/26
  s

module.exports = jsonp
