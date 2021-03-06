quote = encodeURIComponent
jsonp = (options)->
  {url, callback, timeout} = merge jsonp.defaults, options

  while window[cbname = "_#{random 15}"]
    ;

  data = merge options.data
  data[callback] = cbname

  q = ''
  for k, v of data when v? and(v = String(v)).length
    q += "#{if q.length or 0<=url.indexOf '?' then '&' else '?'}#{quote k}=#{quote v}"

  window[cbname] = (data)->
    do Clear
    options.success? data
  Error = ->
    do Clear
    options.error?()

  js = document.createElement 'script'
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
  timeout: 5000

module.exports = jsonp
