#
# order: 20
#

$.jsonp = (options)->

  {url, callback, timeout}=options
  callback ||= 'callback'
  timeout ||= 3000

  while window[cbname = "_#{random 15}"]
    ;

  window[cbname] = (data)-> options.success? data if do Clear
  Error = -> options.error?() if do Clear

  js = document.createElement 'script'
  js.async = true
  js.src = "#{url}#{if url.indexOf('?')>=0 then '&' else '?'}#{callback}=#{cbname}"
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild js
  setTimeout Error, timeout

  Clear = ->
    return unless js
    delete window[cbname]
    js.parentNode.removeChild js
    js = null
    true

random=(q=1)->
  s = ''
  while s.length<q
    n=Math.floor 62*Math.random()
    s+=String.fromCharCode n%26+'Aa0'.charCodeAt n/26
  s
