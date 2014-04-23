merge = require './merge.coffee'

jsonp = (options)->
  {url, callback, timeout} = merge jsonp.defaults, options

  while window[cbname = "_#{random 15}"]
    ;

  data = merge options.data
  data[callback] = cbname

  q = ''
  for k, v of data when (v = String(v or '')).length
    q += (if q.length or 0<=url.indexOf '?' then '&' else '?')+
      encodeURIComponent(k)+'='+
      encodeURIComponent v

  window[cbname] = (data)->
    do Clear
    options.success? data
  Error = ->
    do Clear
    options.error?()

  js = document.createElement 'script'
  js.async = true
  js.onerror = Error
  js.src = url+q
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild js
  h = setTimeout Error, timeout

  Clear = ->
    try delete window[cbname] catch
      window[cbname]=null # MSIE6 !
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
