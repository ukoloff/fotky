#
# order: 10
#
# Random string
#
String.random=(q=1)->
  s=''
  while s.length<q
    n=Math.floor 62*Math.random()
    s+=String.fromCharCode n%26+'Aa0'.charCodeAt n/26
  s
