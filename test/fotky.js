(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//
// without.js - CoffeScript template engine with lexical scoping
//

(function()
{
  var
    nTags='a abbr acronym address applet article aside audio b bdo big blockquote body button \
canvas caption center cite code colgroup command datalist dd del details dfn dir div dl dt \
em embed fieldset figcaption figure font footer form frameset h1 h2 h3 h4 h5 h6 head header hgroup html \
i iframe ins keygen kbd label legend li map mark menu meter nav noframes noscript object \
ol optgroup option output p pre progress q rp rt ruby \
s samp script section select small source span strike strong style sub summary sup \
table tbody td textarea tfoot th thead time title tr tt u ul video wbr xmp'.split(' '),
    eTags='area base basefont br col frame hr img input link meta param'.split(' '),
    htmlEntities={'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'},
    slice=[].slice,
    scope={},
    html='',
    _this

  function h(s)
  {
    return String(s).replace(/[&<>"]/g, function(e){return htmlEntities[e]})
  }

  function children(a)
  {
    var i, e
    for(i=0; i<a.length; i++)
    {
      if(null==(e=a[i])) continue;
      if('function'==typeof e)
        e.call(_this)
      else
        html+=h(e)
    }
  }

  function print(a)
  {
    var i, e
    for(i=0; i<a.length; i++) if(null!=(e=a[i])) html+=h(e)
  }

  function raw(a)
  {
    var i, e
    for(i=0; i<a.length; i++) if(null!=(e=a[i])) html+=e
  }

  function makeTag(name, empty)
  {
    return function(){tag(arguments)}
    function attr(k, v)
    {
      if(null==v || false===v) return
      html+=' '+h(k)
      if(true!==v) html+='="'+h(v)+'"'
    }
    function nest(prefix, obj)
    {
      for(var k in obj)
        if('object'==typeof obj[k])
          nest(prefix+k+'-', obj[k])
        else
          attr(prefix+k, obj[k])
    }
    function tag(a)
    {
      html+='<'+name
      var at=a[0]
      if('object'==typeof at)
      {
       for(var k in at)
         if('data'==k && 'object'==typeof at[k])
           nest('data-', at[k])
         else
           attr(k, at[k])
       a=slice.call(a, 1)
      }
      html+='>'
      if(empty && a.length) throw new SyntaxError("<"+name+"> must have no content!")
      if(empty) return
      children(a)
      html+="</"+name+">"
    }
  }

  function makeComment()
  {
    var level=0;
    return function(){ comment.apply(this, arguments) }
    function comment()
    {
      html+= level++? '<comment level="'+level+'">' : "<!-- "
      children(arguments)
      html+= --level? '</comment>': ' -->'
    }
  }

  function coffeeScript()
  {
    if(1!=arguments.length ||'function'!=typeof arguments[0])
      throw new SyntaxError('Usage: coffeescript -> code')
    html+='<script><!--\n('+arguments[0].toString()+')()\n//-->\n</script>';
  }

  function adhocTag()
  {
    return function(name, empty){ return tag(name, empty) }
    function isEmpty(name)
    {
      for(var i in eTags) if(name==eTags[i]) return true
    }
    function tag(name, empty)
    {
      return makeTag(name, null==empty? isEmpty(String(name).toLowerCase()) : empty)
    }
  }

  function noTag(attrs)
  {
    children('object'==typeof attrs ? slice.call(arguments, 1) : arguments)
  }

  scope.print=scope.text=function(){print(arguments)}
  scope.raw=function(){raw(arguments)}
  scope.tag=adhocTag()
  scope.notag=function(){noTag.apply(this, arguments)}
  scope.comment=makeComment()
  scope.blackhole=function(){}
  scope.coffeescript=function(){ coffeeScript.apply(this, arguments) }

  for(var i in nTags) scope[nTags[i]]=makeTag(nTags[i])
  scope.$var=makeTag('var')
  for(var i in eTags) scope[eTags[i]]=makeTag(eTags[i], true)

  function makeVars()
  {
    var v=[];
    for(var tag in scope) v.push(tag+'=this.'+tag)
    return 'var '+v.join(',')
  }

  function setContext(fn){
    return (new Function(makeVars()+'\nreturn '+fn.toString())).call(scope)
  }

  function renderable(fn)
  {
    if('function'!=typeof fn) throw new TypeError("Call: withOut.compile(function)");
    var pending=true
    return function()
    {
      if(pending)
      {
        fn=setContext(fn)
        pending=false
      }
      try
      {
        var that=_this, x=html
        _this=this
        html=''
        fn.apply(this, arguments)
        return html
      }
      finally
      {
        _this=that
        html=x
      }
    }
  }

  function compile(fn)
  {
    var withOut=renderable(fn);
    return function(){return withOut.apply(this, arguments)}
  }

  function $compile(fn)
  {
    var withOut=renderable(fn);
    return function(){return withOut.apply(arguments[0], arguments)}
  }

  function flatten(array)
  {
    var v, r=[]
    for(var i in array)
      if('object'==typeof(v=array[i]))
        r.push.apply(r, flatten(v))
      else
        r.push(v)
    return r
  }

  function fetchJSTs(paths)
  {
    var v
    for(var i in paths)
    {
      if('function'!=typeof(v=paths[i]) &&
         'function'!=typeof(v=JST[v]))
        throw new Error("JST['"+paths[i]+"'] not found or incorrect!")
      paths[i]=renderable(v)
    }
    return paths
  }

  function JSTs(path)
  {
    var bound, Ts=flatten(slice.call(arguments))
    return function(){return JSTs.apply(arguments[0], arguments)}
    function JSTs()
    {
      var S=''
      if(!bound)
      {
        Ts=fetchJSTs(Ts)
        bound=true
      }
      for(var i in Ts) S+=Ts[i].apply(this, arguments)
      return S
    }
  }

  var interface={
    compile: compile,
    renderable: compile,
    $compile: $compile,
    JSTs: JSTs
  }
  if('undefined'!=typeof module && module.exports)
    module.exports=interface
  else if('function'==typeof define && define.amd)
    define(interface)
  else
    this.withOut=interface
})()

//--[EOF]------------------------------------------------------------

},{}],2:[function(require,module,exports){
require('without');

},{"without":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVGVtcFxcZ2l0XFxmb3RreVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9UZW1wL2dpdC9mb3RreS9ub2RlX21vZHVsZXMvd2l0aG91dC93aXRob3V0LmpzIiwiQzovVGVtcC9naXQvZm90a3kvc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUEE7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9cclxuLy8gd2l0aG91dC5qcyAtIENvZmZlU2NyaXB0IHRlbXBsYXRlIGVuZ2luZSB3aXRoIGxleGljYWwgc2NvcGluZ1xyXG4vL1xyXG5cclxuKGZ1bmN0aW9uKClcclxue1xyXG4gIHZhclxyXG4gICAgblRhZ3M9J2EgYWJiciBhY3JvbnltIGFkZHJlc3MgYXBwbGV0IGFydGljbGUgYXNpZGUgYXVkaW8gYiBiZG8gYmlnIGJsb2NrcXVvdGUgYm9keSBidXR0b24gXFxcclxuY2FudmFzIGNhcHRpb24gY2VudGVyIGNpdGUgY29kZSBjb2xncm91cCBjb21tYW5kIGRhdGFsaXN0IGRkIGRlbCBkZXRhaWxzIGRmbiBkaXIgZGl2IGRsIGR0IFxcXHJcbmVtIGVtYmVkIGZpZWxkc2V0IGZpZ2NhcHRpb24gZmlndXJlIGZvbnQgZm9vdGVyIGZvcm0gZnJhbWVzZXQgaDEgaDIgaDMgaDQgaDUgaDYgaGVhZCBoZWFkZXIgaGdyb3VwIGh0bWwgXFxcclxuaSBpZnJhbWUgaW5zIGtleWdlbiBrYmQgbGFiZWwgbGVnZW5kIGxpIG1hcCBtYXJrIG1lbnUgbWV0ZXIgbmF2IG5vZnJhbWVzIG5vc2NyaXB0IG9iamVjdCBcXFxyXG5vbCBvcHRncm91cCBvcHRpb24gb3V0cHV0IHAgcHJlIHByb2dyZXNzIHEgcnAgcnQgcnVieSBcXFxyXG5zIHNhbXAgc2NyaXB0IHNlY3Rpb24gc2VsZWN0IHNtYWxsIHNvdXJjZSBzcGFuIHN0cmlrZSBzdHJvbmcgc3R5bGUgc3ViIHN1bW1hcnkgc3VwIFxcXHJcbnRhYmxlIHRib2R5IHRkIHRleHRhcmVhIHRmb290IHRoIHRoZWFkIHRpbWUgdGl0bGUgdHIgdHQgdSB1bCB2aWRlbyB3YnIgeG1wJy5zcGxpdCgnICcpLFxyXG4gICAgZVRhZ3M9J2FyZWEgYmFzZSBiYXNlZm9udCBiciBjb2wgZnJhbWUgaHIgaW1nIGlucHV0IGxpbmsgbWV0YSBwYXJhbScuc3BsaXQoJyAnKSxcclxuICAgIGh0bWxFbnRpdGllcz17JyYnOiAnJmFtcDsnLCAnPCc6ICcmbHQ7JywgJz4nOiAnJmd0OycsICdcIic6ICcmcXVvdDsnfSxcclxuICAgIHNsaWNlPVtdLnNsaWNlLFxyXG4gICAgc2NvcGU9e30sXHJcbiAgICBodG1sPScnLFxyXG4gICAgX3RoaXNcclxuXHJcbiAgZnVuY3Rpb24gaChzKVxyXG4gIHtcclxuICAgIHJldHVybiBTdHJpbmcocykucmVwbGFjZSgvWyY8PlwiXS9nLCBmdW5jdGlvbihlKXtyZXR1cm4gaHRtbEVudGl0aWVzW2VdfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNoaWxkcmVuKGEpXHJcbiAge1xyXG4gICAgdmFyIGksIGVcclxuICAgIGZvcihpPTA7IGk8YS5sZW5ndGg7IGkrKylcclxuICAgIHtcclxuICAgICAgaWYobnVsbD09KGU9YVtpXSkpIGNvbnRpbnVlO1xyXG4gICAgICBpZignZnVuY3Rpb24nPT10eXBlb2YgZSlcclxuICAgICAgICBlLmNhbGwoX3RoaXMpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBodG1sKz1oKGUpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwcmludChhKVxyXG4gIHtcclxuICAgIHZhciBpLCBlXHJcbiAgICBmb3IoaT0wOyBpPGEubGVuZ3RoOyBpKyspIGlmKG51bGwhPShlPWFbaV0pKSBodG1sKz1oKGUpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByYXcoYSlcclxuICB7XHJcbiAgICB2YXIgaSwgZVxyXG4gICAgZm9yKGk9MDsgaTxhLmxlbmd0aDsgaSsrKSBpZihudWxsIT0oZT1hW2ldKSkgaHRtbCs9ZVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWFrZVRhZyhuYW1lLCBlbXB0eSlcclxuICB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXt0YWcoYXJndW1lbnRzKX1cclxuICAgIGZ1bmN0aW9uIGF0dHIoaywgdilcclxuICAgIHtcclxuICAgICAgaWYobnVsbD09diB8fCBmYWxzZT09PXYpIHJldHVyblxyXG4gICAgICBodG1sKz0nICcraChrKVxyXG4gICAgICBpZih0cnVlIT09dikgaHRtbCs9Jz1cIicraCh2KSsnXCInXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBuZXN0KHByZWZpeCwgb2JqKVxyXG4gICAge1xyXG4gICAgICBmb3IodmFyIGsgaW4gb2JqKVxyXG4gICAgICAgIGlmKCdvYmplY3QnPT10eXBlb2Ygb2JqW2tdKVxyXG4gICAgICAgICAgbmVzdChwcmVmaXgraysnLScsIG9ialtrXSlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBhdHRyKHByZWZpeCtrLCBvYmpba10pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0YWcoYSlcclxuICAgIHtcclxuICAgICAgaHRtbCs9JzwnK25hbWVcclxuICAgICAgdmFyIGF0PWFbMF1cclxuICAgICAgaWYoJ29iamVjdCc9PXR5cGVvZiBhdClcclxuICAgICAge1xyXG4gICAgICAgZm9yKHZhciBrIGluIGF0KVxyXG4gICAgICAgICBpZignZGF0YSc9PWsgJiYgJ29iamVjdCc9PXR5cGVvZiBhdFtrXSlcclxuICAgICAgICAgICBuZXN0KCdkYXRhLScsIGF0W2tdKVxyXG4gICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgYXR0cihrLCBhdFtrXSlcclxuICAgICAgIGE9c2xpY2UuY2FsbChhLCAxKVxyXG4gICAgICB9XHJcbiAgICAgIGh0bWwrPSc+J1xyXG4gICAgICBpZihlbXB0eSAmJiBhLmxlbmd0aCkgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiPFwiK25hbWUrXCI+IG11c3QgaGF2ZSBubyBjb250ZW50IVwiKVxyXG4gICAgICBpZihlbXB0eSkgcmV0dXJuXHJcbiAgICAgIGNoaWxkcmVuKGEpXHJcbiAgICAgIGh0bWwrPVwiPC9cIituYW1lK1wiPlwiXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYWtlQ29tbWVudCgpXHJcbiAge1xyXG4gICAgdmFyIGxldmVsPTA7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXsgY29tbWVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpIH1cclxuICAgIGZ1bmN0aW9uIGNvbW1lbnQoKVxyXG4gICAge1xyXG4gICAgICBodG1sKz0gbGV2ZWwrKz8gJzxjb21tZW50IGxldmVsPVwiJytsZXZlbCsnXCI+JyA6IFwiPCEtLSBcIlxyXG4gICAgICBjaGlsZHJlbihhcmd1bWVudHMpXHJcbiAgICAgIGh0bWwrPSAtLWxldmVsPyAnPC9jb21tZW50Pic6ICcgLS0+J1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29mZmVlU2NyaXB0KClcclxuICB7XHJcbiAgICBpZigxIT1hcmd1bWVudHMubGVuZ3RoIHx8J2Z1bmN0aW9uJyE9dHlwZW9mIGFyZ3VtZW50c1swXSlcclxuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdVc2FnZTogY29mZmVlc2NyaXB0IC0+IGNvZGUnKVxyXG4gICAgaHRtbCs9JzxzY3JpcHQ+PCEtLVxcbignK2FyZ3VtZW50c1swXS50b1N0cmluZygpKycpKClcXG4vLy0tPlxcbjwvc2NyaXB0Pic7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGhvY1RhZygpXHJcbiAge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG5hbWUsIGVtcHR5KXsgcmV0dXJuIHRhZyhuYW1lLCBlbXB0eSkgfVxyXG4gICAgZnVuY3Rpb24gaXNFbXB0eShuYW1lKVxyXG4gICAge1xyXG4gICAgICBmb3IodmFyIGkgaW4gZVRhZ3MpIGlmKG5hbWU9PWVUYWdzW2ldKSByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gdGFnKG5hbWUsIGVtcHR5KVxyXG4gICAge1xyXG4gICAgICByZXR1cm4gbWFrZVRhZyhuYW1lLCBudWxsPT1lbXB0eT8gaXNFbXB0eShTdHJpbmcobmFtZSkudG9Mb3dlckNhc2UoKSkgOiBlbXB0eSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG5vVGFnKGF0dHJzKVxyXG4gIHtcclxuICAgIGNoaWxkcmVuKCdvYmplY3QnPT10eXBlb2YgYXR0cnMgPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBhcmd1bWVudHMpXHJcbiAgfVxyXG5cclxuICBzY29wZS5wcmludD1zY29wZS50ZXh0PWZ1bmN0aW9uKCl7cHJpbnQoYXJndW1lbnRzKX1cclxuICBzY29wZS5yYXc9ZnVuY3Rpb24oKXtyYXcoYXJndW1lbnRzKX1cclxuICBzY29wZS50YWc9YWRob2NUYWcoKVxyXG4gIHNjb3BlLm5vdGFnPWZ1bmN0aW9uKCl7bm9UYWcuYXBwbHkodGhpcywgYXJndW1lbnRzKX1cclxuICBzY29wZS5jb21tZW50PW1ha2VDb21tZW50KClcclxuICBzY29wZS5ibGFja2hvbGU9ZnVuY3Rpb24oKXt9XHJcbiAgc2NvcGUuY29mZmVlc2NyaXB0PWZ1bmN0aW9uKCl7IGNvZmZlZVNjcmlwdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpIH1cclxuXHJcbiAgZm9yKHZhciBpIGluIG5UYWdzKSBzY29wZVtuVGFnc1tpXV09bWFrZVRhZyhuVGFnc1tpXSlcclxuICBzY29wZS4kdmFyPW1ha2VUYWcoJ3ZhcicpXHJcbiAgZm9yKHZhciBpIGluIGVUYWdzKSBzY29wZVtlVGFnc1tpXV09bWFrZVRhZyhlVGFnc1tpXSwgdHJ1ZSlcclxuXHJcbiAgZnVuY3Rpb24gbWFrZVZhcnMoKVxyXG4gIHtcclxuICAgIHZhciB2PVtdO1xyXG4gICAgZm9yKHZhciB0YWcgaW4gc2NvcGUpIHYucHVzaCh0YWcrJz10aGlzLicrdGFnKVxyXG4gICAgcmV0dXJuICd2YXIgJyt2LmpvaW4oJywnKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2V0Q29udGV4dChmbil7XHJcbiAgICByZXR1cm4gKG5ldyBGdW5jdGlvbihtYWtlVmFycygpKydcXG5yZXR1cm4gJytmbi50b1N0cmluZygpKSkuY2FsbChzY29wZSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlcmFibGUoZm4pXHJcbiAge1xyXG4gICAgaWYoJ2Z1bmN0aW9uJyE9dHlwZW9mIGZuKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2FsbDogd2l0aE91dC5jb21waWxlKGZ1bmN0aW9uKVwiKTtcclxuICAgIHZhciBwZW5kaW5nPXRydWVcclxuICAgIHJldHVybiBmdW5jdGlvbigpXHJcbiAgICB7XHJcbiAgICAgIGlmKHBlbmRpbmcpXHJcbiAgICAgIHtcclxuICAgICAgICBmbj1zZXRDb250ZXh0KGZuKVxyXG4gICAgICAgIHBlbmRpbmc9ZmFsc2VcclxuICAgICAgfVxyXG4gICAgICB0cnlcclxuICAgICAge1xyXG4gICAgICAgIHZhciB0aGF0PV90aGlzLCB4PWh0bWxcclxuICAgICAgICBfdGhpcz10aGlzXHJcbiAgICAgICAgaHRtbD0nJ1xyXG4gICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcclxuICAgICAgICByZXR1cm4gaHRtbFxyXG4gICAgICB9XHJcbiAgICAgIGZpbmFsbHlcclxuICAgICAge1xyXG4gICAgICAgIF90aGlzPXRoYXRcclxuICAgICAgICBodG1sPXhcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29tcGlsZShmbilcclxuICB7XHJcbiAgICB2YXIgd2l0aE91dD1yZW5kZXJhYmxlKGZuKTtcclxuICAgIHJldHVybiBmdW5jdGlvbigpe3JldHVybiB3aXRoT3V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyl9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiAkY29tcGlsZShmbilcclxuICB7XHJcbiAgICB2YXIgd2l0aE91dD1yZW5kZXJhYmxlKGZuKTtcclxuICAgIHJldHVybiBmdW5jdGlvbigpe3JldHVybiB3aXRoT3V0LmFwcGx5KGFyZ3VtZW50c1swXSwgYXJndW1lbnRzKX1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZsYXR0ZW4oYXJyYXkpXHJcbiAge1xyXG4gICAgdmFyIHYsIHI9W11cclxuICAgIGZvcih2YXIgaSBpbiBhcnJheSlcclxuICAgICAgaWYoJ29iamVjdCc9PXR5cGVvZih2PWFycmF5W2ldKSlcclxuICAgICAgICByLnB1c2guYXBwbHkociwgZmxhdHRlbih2KSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHIucHVzaCh2KVxyXG4gICAgcmV0dXJuIHJcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZldGNoSlNUcyhwYXRocylcclxuICB7XHJcbiAgICB2YXIgdlxyXG4gICAgZm9yKHZhciBpIGluIHBhdGhzKVxyXG4gICAge1xyXG4gICAgICBpZignZnVuY3Rpb24nIT10eXBlb2Yodj1wYXRoc1tpXSkgJiZcclxuICAgICAgICAgJ2Z1bmN0aW9uJyE9dHlwZW9mKHY9SlNUW3ZdKSlcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJKU1RbJ1wiK3BhdGhzW2ldK1wiJ10gbm90IGZvdW5kIG9yIGluY29ycmVjdCFcIilcclxuICAgICAgcGF0aHNbaV09cmVuZGVyYWJsZSh2KVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhdGhzXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBKU1RzKHBhdGgpXHJcbiAge1xyXG4gICAgdmFyIGJvdW5kLCBUcz1mbGF0dGVuKHNsaWNlLmNhbGwoYXJndW1lbnRzKSlcclxuICAgIHJldHVybiBmdW5jdGlvbigpe3JldHVybiBKU1RzLmFwcGx5KGFyZ3VtZW50c1swXSwgYXJndW1lbnRzKX1cclxuICAgIGZ1bmN0aW9uIEpTVHMoKVxyXG4gICAge1xyXG4gICAgICB2YXIgUz0nJ1xyXG4gICAgICBpZighYm91bmQpXHJcbiAgICAgIHtcclxuICAgICAgICBUcz1mZXRjaEpTVHMoVHMpXHJcbiAgICAgICAgYm91bmQ9dHJ1ZVxyXG4gICAgICB9XHJcbiAgICAgIGZvcih2YXIgaSBpbiBUcykgUys9VHNbaV0uYXBwbHkodGhpcywgYXJndW1lbnRzKVxyXG4gICAgICByZXR1cm4gU1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIGludGVyZmFjZT17XHJcbiAgICBjb21waWxlOiBjb21waWxlLFxyXG4gICAgcmVuZGVyYWJsZTogY29tcGlsZSxcclxuICAgICRjb21waWxlOiAkY29tcGlsZSxcclxuICAgIEpTVHM6IEpTVHNcclxuICB9XHJcbiAgaWYoJ3VuZGVmaW5lZCchPXR5cGVvZiBtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpXHJcbiAgICBtb2R1bGUuZXhwb3J0cz1pbnRlcmZhY2VcclxuICBlbHNlIGlmKCdmdW5jdGlvbic9PXR5cGVvZiBkZWZpbmUgJiYgZGVmaW5lLmFtZClcclxuICAgIGRlZmluZShpbnRlcmZhY2UpXHJcbiAgZWxzZVxyXG4gICAgdGhpcy53aXRoT3V0PWludGVyZmFjZVxyXG59KSgpXHJcblxyXG4vLy0tW0VPRl0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIiwicmVxdWlyZSgnd2l0aG91dCcpO1xuIl19
