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
require(1);

},{"1":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVGVtcFxcZ2l0XFxmb3RreVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVGVtcC9naXQvZm90a3kvbm9kZV9tb2R1bGVzL3dpdGhvdXQvd2l0aG91dC5qcyIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFBBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vXHJcbi8vIHdpdGhvdXQuanMgLSBDb2ZmZVNjcmlwdCB0ZW1wbGF0ZSBlbmdpbmUgd2l0aCBsZXhpY2FsIHNjb3BpbmdcclxuLy9cclxuXHJcbihmdW5jdGlvbigpXHJcbntcclxuICB2YXJcclxuICAgIG5UYWdzPSdhIGFiYnIgYWNyb255bSBhZGRyZXNzIGFwcGxldCBhcnRpY2xlIGFzaWRlIGF1ZGlvIGIgYmRvIGJpZyBibG9ja3F1b3RlIGJvZHkgYnV0dG9uIFxcXHJcbmNhbnZhcyBjYXB0aW9uIGNlbnRlciBjaXRlIGNvZGUgY29sZ3JvdXAgY29tbWFuZCBkYXRhbGlzdCBkZCBkZWwgZGV0YWlscyBkZm4gZGlyIGRpdiBkbCBkdCBcXFxyXG5lbSBlbWJlZCBmaWVsZHNldCBmaWdjYXB0aW9uIGZpZ3VyZSBmb250IGZvb3RlciBmb3JtIGZyYW1lc2V0IGgxIGgyIGgzIGg0IGg1IGg2IGhlYWQgaGVhZGVyIGhncm91cCBodG1sIFxcXHJcbmkgaWZyYW1lIGlucyBrZXlnZW4ga2JkIGxhYmVsIGxlZ2VuZCBsaSBtYXAgbWFyayBtZW51IG1ldGVyIG5hdiBub2ZyYW1lcyBub3NjcmlwdCBvYmplY3QgXFxcclxub2wgb3B0Z3JvdXAgb3B0aW9uIG91dHB1dCBwIHByZSBwcm9ncmVzcyBxIHJwIHJ0IHJ1YnkgXFxcclxucyBzYW1wIHNjcmlwdCBzZWN0aW9uIHNlbGVjdCBzbWFsbCBzb3VyY2Ugc3BhbiBzdHJpa2Ugc3Ryb25nIHN0eWxlIHN1YiBzdW1tYXJ5IHN1cCBcXFxyXG50YWJsZSB0Ym9keSB0ZCB0ZXh0YXJlYSB0Zm9vdCB0aCB0aGVhZCB0aW1lIHRpdGxlIHRyIHR0IHUgdWwgdmlkZW8gd2JyIHhtcCcuc3BsaXQoJyAnKSxcclxuICAgIGVUYWdzPSdhcmVhIGJhc2UgYmFzZWZvbnQgYnIgY29sIGZyYW1lIGhyIGltZyBpbnB1dCBsaW5rIG1ldGEgcGFyYW0nLnNwbGl0KCcgJyksXHJcbiAgICBodG1sRW50aXRpZXM9eycmJzogJyZhbXA7JywgJzwnOiAnJmx0OycsICc+JzogJyZndDsnLCAnXCInOiAnJnF1b3Q7J30sXHJcbiAgICBzbGljZT1bXS5zbGljZSxcclxuICAgIHNjb3BlPXt9LFxyXG4gICAgaHRtbD0nJyxcclxuICAgIF90aGlzXHJcblxyXG4gIGZ1bmN0aW9uIGgocylcclxuICB7XHJcbiAgICByZXR1cm4gU3RyaW5nKHMpLnJlcGxhY2UoL1smPD5cIl0vZywgZnVuY3Rpb24oZSl7cmV0dXJuIGh0bWxFbnRpdGllc1tlXX0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGlsZHJlbihhKVxyXG4gIHtcclxuICAgIHZhciBpLCBlXHJcbiAgICBmb3IoaT0wOyBpPGEubGVuZ3RoOyBpKyspXHJcbiAgICB7XHJcbiAgICAgIGlmKG51bGw9PShlPWFbaV0pKSBjb250aW51ZTtcclxuICAgICAgaWYoJ2Z1bmN0aW9uJz09dHlwZW9mIGUpXHJcbiAgICAgICAgZS5jYWxsKF90aGlzKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaHRtbCs9aChlKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcHJpbnQoYSlcclxuICB7XHJcbiAgICB2YXIgaSwgZVxyXG4gICAgZm9yKGk9MDsgaTxhLmxlbmd0aDsgaSsrKSBpZihudWxsIT0oZT1hW2ldKSkgaHRtbCs9aChlKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmF3KGEpXHJcbiAge1xyXG4gICAgdmFyIGksIGVcclxuICAgIGZvcihpPTA7IGk8YS5sZW5ndGg7IGkrKykgaWYobnVsbCE9KGU9YVtpXSkpIGh0bWwrPWVcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG1ha2VUYWcobmFtZSwgZW1wdHkpXHJcbiAge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7dGFnKGFyZ3VtZW50cyl9XHJcbiAgICBmdW5jdGlvbiBhdHRyKGssIHYpXHJcbiAgICB7XHJcbiAgICAgIGlmKG51bGw9PXYgfHwgZmFsc2U9PT12KSByZXR1cm5cclxuICAgICAgaHRtbCs9JyAnK2goaylcclxuICAgICAgaWYodHJ1ZSE9PXYpIGh0bWwrPSc9XCInK2godikrJ1wiJ1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbmVzdChwcmVmaXgsIG9iailcclxuICAgIHtcclxuICAgICAgZm9yKHZhciBrIGluIG9iailcclxuICAgICAgICBpZignb2JqZWN0Jz09dHlwZW9mIG9ialtrXSlcclxuICAgICAgICAgIG5lc3QocHJlZml4K2srJy0nLCBvYmpba10pXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgYXR0cihwcmVmaXgraywgb2JqW2tdKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gdGFnKGEpXHJcbiAgICB7XHJcbiAgICAgIGh0bWwrPSc8JytuYW1lXHJcbiAgICAgIHZhciBhdD1hWzBdXHJcbiAgICAgIGlmKCdvYmplY3QnPT10eXBlb2YgYXQpXHJcbiAgICAgIHtcclxuICAgICAgIGZvcih2YXIgayBpbiBhdClcclxuICAgICAgICAgaWYoJ2RhdGEnPT1rICYmICdvYmplY3QnPT10eXBlb2YgYXRba10pXHJcbiAgICAgICAgICAgbmVzdCgnZGF0YS0nLCBhdFtrXSlcclxuICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIGF0dHIoaywgYXRba10pXHJcbiAgICAgICBhPXNsaWNlLmNhbGwoYSwgMSlcclxuICAgICAgfVxyXG4gICAgICBodG1sKz0nPidcclxuICAgICAgaWYoZW1wdHkgJiYgYS5sZW5ndGgpIHRocm93IG5ldyBTeW50YXhFcnJvcihcIjxcIituYW1lK1wiPiBtdXN0IGhhdmUgbm8gY29udGVudCFcIilcclxuICAgICAgaWYoZW1wdHkpIHJldHVyblxyXG4gICAgICBjaGlsZHJlbihhKVxyXG4gICAgICBodG1sKz1cIjwvXCIrbmFtZStcIj5cIlxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWFrZUNvbW1lbnQoKVxyXG4gIHtcclxuICAgIHZhciBsZXZlbD0wO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7IGNvbW1lbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKSB9XHJcbiAgICBmdW5jdGlvbiBjb21tZW50KClcclxuICAgIHtcclxuICAgICAgaHRtbCs9IGxldmVsKys/ICc8Y29tbWVudCBsZXZlbD1cIicrbGV2ZWwrJ1wiPicgOiBcIjwhLS0gXCJcclxuICAgICAgY2hpbGRyZW4oYXJndW1lbnRzKVxyXG4gICAgICBodG1sKz0gLS1sZXZlbD8gJzwvY29tbWVudD4nOiAnIC0tPidcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvZmZlZVNjcmlwdCgpXHJcbiAge1xyXG4gICAgaWYoMSE9YXJndW1lbnRzLmxlbmd0aCB8fCdmdW5jdGlvbichPXR5cGVvZiBhcmd1bWVudHNbMF0pXHJcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcignVXNhZ2U6IGNvZmZlZXNjcmlwdCAtPiBjb2RlJylcclxuICAgIGh0bWwrPSc8c2NyaXB0PjwhLS1cXG4oJythcmd1bWVudHNbMF0udG9TdHJpbmcoKSsnKSgpXFxuLy8tLT5cXG48L3NjcmlwdD4nO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRob2NUYWcoKVxyXG4gIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihuYW1lLCBlbXB0eSl7IHJldHVybiB0YWcobmFtZSwgZW1wdHkpIH1cclxuICAgIGZ1bmN0aW9uIGlzRW1wdHkobmFtZSlcclxuICAgIHtcclxuICAgICAgZm9yKHZhciBpIGluIGVUYWdzKSBpZihuYW1lPT1lVGFnc1tpXSkgcmV0dXJuIHRydWVcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHRhZyhuYW1lLCBlbXB0eSlcclxuICAgIHtcclxuICAgICAgcmV0dXJuIG1ha2VUYWcobmFtZSwgbnVsbD09ZW1wdHk/IGlzRW1wdHkoU3RyaW5nKG5hbWUpLnRvTG93ZXJDYXNlKCkpIDogZW1wdHkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBub1RhZyhhdHRycylcclxuICB7XHJcbiAgICBjaGlsZHJlbignb2JqZWN0Jz09dHlwZW9mIGF0dHJzID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogYXJndW1lbnRzKVxyXG4gIH1cclxuXHJcbiAgc2NvcGUucHJpbnQ9c2NvcGUudGV4dD1mdW5jdGlvbigpe3ByaW50KGFyZ3VtZW50cyl9XHJcbiAgc2NvcGUucmF3PWZ1bmN0aW9uKCl7cmF3KGFyZ3VtZW50cyl9XHJcbiAgc2NvcGUudGFnPWFkaG9jVGFnKClcclxuICBzY29wZS5ub3RhZz1mdW5jdGlvbigpe25vVGFnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyl9XHJcbiAgc2NvcGUuY29tbWVudD1tYWtlQ29tbWVudCgpXHJcbiAgc2NvcGUuYmxhY2tob2xlPWZ1bmN0aW9uKCl7fVxyXG4gIHNjb3BlLmNvZmZlZXNjcmlwdD1mdW5jdGlvbigpeyBjb2ZmZWVTY3JpcHQuYXBwbHkodGhpcywgYXJndW1lbnRzKSB9XHJcblxyXG4gIGZvcih2YXIgaSBpbiBuVGFncykgc2NvcGVbblRhZ3NbaV1dPW1ha2VUYWcoblRhZ3NbaV0pXHJcbiAgc2NvcGUuJHZhcj1tYWtlVGFnKCd2YXInKVxyXG4gIGZvcih2YXIgaSBpbiBlVGFncykgc2NvcGVbZVRhZ3NbaV1dPW1ha2VUYWcoZVRhZ3NbaV0sIHRydWUpXHJcblxyXG4gIGZ1bmN0aW9uIG1ha2VWYXJzKClcclxuICB7XHJcbiAgICB2YXIgdj1bXTtcclxuICAgIGZvcih2YXIgdGFnIGluIHNjb3BlKSB2LnB1c2godGFnKyc9dGhpcy4nK3RhZylcclxuICAgIHJldHVybiAndmFyICcrdi5qb2luKCcsJylcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNldENvbnRleHQoZm4pe1xyXG4gICAgcmV0dXJuIChuZXcgRnVuY3Rpb24obWFrZVZhcnMoKSsnXFxucmV0dXJuICcrZm4udG9TdHJpbmcoKSkpLmNhbGwoc2NvcGUpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJhYmxlKGZuKVxyXG4gIHtcclxuICAgIGlmKCdmdW5jdGlvbichPXR5cGVvZiBmbikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbGw6IHdpdGhPdXQuY29tcGlsZShmdW5jdGlvbilcIik7XHJcbiAgICB2YXIgcGVuZGluZz10cnVlXHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKVxyXG4gICAge1xyXG4gICAgICBpZihwZW5kaW5nKVxyXG4gICAgICB7XHJcbiAgICAgICAgZm49c2V0Q29udGV4dChmbilcclxuICAgICAgICBwZW5kaW5nPWZhbHNlXHJcbiAgICAgIH1cclxuICAgICAgdHJ5XHJcbiAgICAgIHtcclxuICAgICAgICB2YXIgdGhhdD1fdGhpcywgeD1odG1sXHJcbiAgICAgICAgX3RoaXM9dGhpc1xyXG4gICAgICAgIGh0bWw9JydcclxuICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXHJcbiAgICAgICAgcmV0dXJuIGh0bWxcclxuICAgICAgfVxyXG4gICAgICBmaW5hbGx5XHJcbiAgICAgIHtcclxuICAgICAgICBfdGhpcz10aGF0XHJcbiAgICAgICAgaHRtbD14XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbXBpbGUoZm4pXHJcbiAge1xyXG4gICAgdmFyIHdpdGhPdXQ9cmVuZGVyYWJsZShmbik7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gd2l0aE91dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gJGNvbXBpbGUoZm4pXHJcbiAge1xyXG4gICAgdmFyIHdpdGhPdXQ9cmVuZGVyYWJsZShmbik7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gd2l0aE91dC5hcHBseShhcmd1bWVudHNbMF0sIGFyZ3VtZW50cyl9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmbGF0dGVuKGFycmF5KVxyXG4gIHtcclxuICAgIHZhciB2LCByPVtdXHJcbiAgICBmb3IodmFyIGkgaW4gYXJyYXkpXHJcbiAgICAgIGlmKCdvYmplY3QnPT10eXBlb2Yodj1hcnJheVtpXSkpXHJcbiAgICAgICAgci5wdXNoLmFwcGx5KHIsIGZsYXR0ZW4odikpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICByLnB1c2godilcclxuICAgIHJldHVybiByXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmZXRjaEpTVHMocGF0aHMpXHJcbiAge1xyXG4gICAgdmFyIHZcclxuICAgIGZvcih2YXIgaSBpbiBwYXRocylcclxuICAgIHtcclxuICAgICAgaWYoJ2Z1bmN0aW9uJyE9dHlwZW9mKHY9cGF0aHNbaV0pICYmXHJcbiAgICAgICAgICdmdW5jdGlvbichPXR5cGVvZih2PUpTVFt2XSkpXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSlNUWydcIitwYXRoc1tpXStcIiddIG5vdCBmb3VuZCBvciBpbmNvcnJlY3QhXCIpXHJcbiAgICAgIHBhdGhzW2ldPXJlbmRlcmFibGUodilcclxuICAgIH1cclxuICAgIHJldHVybiBwYXRoc1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gSlNUcyhwYXRoKVxyXG4gIHtcclxuICAgIHZhciBib3VuZCwgVHM9ZmxhdHRlbihzbGljZS5jYWxsKGFyZ3VtZW50cykpXHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gSlNUcy5hcHBseShhcmd1bWVudHNbMF0sIGFyZ3VtZW50cyl9XHJcbiAgICBmdW5jdGlvbiBKU1RzKClcclxuICAgIHtcclxuICAgICAgdmFyIFM9JydcclxuICAgICAgaWYoIWJvdW5kKVxyXG4gICAgICB7XHJcbiAgICAgICAgVHM9ZmV0Y2hKU1RzKFRzKVxyXG4gICAgICAgIGJvdW5kPXRydWVcclxuICAgICAgfVxyXG4gICAgICBmb3IodmFyIGkgaW4gVHMpIFMrPVRzW2ldLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcclxuICAgICAgcmV0dXJuIFNcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHZhciBpbnRlcmZhY2U9e1xyXG4gICAgY29tcGlsZTogY29tcGlsZSxcclxuICAgIHJlbmRlcmFibGU6IGNvbXBpbGUsXHJcbiAgICAkY29tcGlsZTogJGNvbXBpbGUsXHJcbiAgICBKU1RzOiBKU1RzXHJcbiAgfVxyXG4gIGlmKCd1bmRlZmluZWQnIT10eXBlb2YgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKVxyXG4gICAgbW9kdWxlLmV4cG9ydHM9aW50ZXJmYWNlXHJcbiAgZWxzZSBpZignZnVuY3Rpb24nPT10eXBlb2YgZGVmaW5lICYmIGRlZmluZS5hbWQpXHJcbiAgICBkZWZpbmUoaW50ZXJmYWNlKVxyXG4gIGVsc2VcclxuICAgIHRoaXMud2l0aE91dD1pbnRlcmZhY2VcclxufSkoKVxyXG5cclxuLy8tLVtFT0ZdLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiIsInJlcXVpcmUoMSk7XG4iXX0=
