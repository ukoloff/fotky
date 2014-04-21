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
var random;

module.exports = function(options) {
  var Clear, Error, callback, cbname, js, timeout, url;
  url = options.url, callback = options.callback, timeout = options.timeout;
  callback || (callback = 'callback');
  timeout || (timeout = 3000);
  while (window[cbname = "_" + (random(15))]) {}
  window[cbname] = function(data) {
    if (Clear()) {
      return typeof options.success === "function" ? options.success(data) : void 0;
    }
  };
  Error = function() {
    if (Clear()) {
      return typeof options.error === "function" ? options.error() : void 0;
    }
  };
  js = document.createElement('script');
  js.async = true;
  js.onerror = Error;
  js.src = "" + url + (url.indexOf('?') >= 0 ? '&' : '?') + callback + "=" + cbname;
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(js);
  setTimeout(Error, timeout);
  Clear = function() {
    if (!js) {
      return;
    }
    delete window[cbname];
    js.parentNode.removeChild(js);
    js = null;
    return true;
  };
};

random = function(q) {
  var n, s;
  if (q == null) {
    q = 1;
  }
  s = '';
  while (s.length < q) {
    n = Math.floor(62 * Math.random());
    s += String.fromCharCode(n % 26 + 'Aa0'.charCodeAt(n / 26));
  }
  return s;
};

},{}],3:[function(require,module,exports){
var Yuser, load, render, t, u, withOut;

withOut = require(2);

Yuser = require(1);

u = new Yuser('stanislav-ukolov', {
  success: function() {
    var a, _i, _len, _ref;
    _ref = this.yalbums;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.def.img) {
        load(a);
        return;
      }
    }
    return console.log('No albums found');
  }
});

load = function(a) {
  return a.loadPhotos({
    error: function() {
      return console.log('Oops');
    },
    success: function() {
      return render(this);
    }
  });
};

render = function(yalbum) {
  return document.getElementById('fotky').innerHTML = t(yalbum.ymgs);
};

t = withOut.$compile(function(list, size) {
  var y, yz, _i, _len;
  if (size == null) {
    size = 'S';
  }
  for (_i = 0, _len = list.length; _i < _len; _i++) {
    y = list[_i];
    yz = y.def.img[size];
    div({
      "class": 'thumbnail'
    }, function() {
      return a({
        style: "width: " + yz.width + "px;",
        href: "#" + (y.fullPath()),
        title: y.def.title || null
      }, function() {
        img({
          src: yz.href
        });
        div(function() {
          return b(y.def.title);
        });
        return div({
          title: y.def.summary || null
        }, function() {
          return small(y.def.summary);
        });
      });
    });
  }
});

},{"1":6,"2":1}],4:[function(require,module,exports){
var Yalbum, Ymg, jsonp;

Ymg = require(1);

jsonp = require(2);

Yalbum = function(yuser, def) {
  this.def = def;
  this.id = def.id.split(':').reverse()[0];
  return this.path = yuser.id;
};

Yalbum.prototype = {
  loadPhotos: function(options) {
    if (!this.visible()) {
      return;
    }
    return jsonp({
      url: this.def.links.photos,
      success: (function(_this) {
        return function(data) {
          var y, _ref;
          _this.ymgs = (function() {
            var _i, _len, _ref, _results;
            _ref = (this.photos = data).entries;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              y = _ref[_i];
              _results.push(new Ymg(this, y));
            }
            return _results;
          }).call(_this);
          return (_ref = options.success) != null ? _ref.call(_this) : void 0;
        };
      })(this),
      error: (function(_this) {
        return function() {
          var _ref;
          return (_ref = options.error) != null ? _ref.call(_this) : void 0;
        };
      })(this)
    });
  },
  fullPath: function() {
    return "" + this.path + "/" + this.id;
  },
  visible: function() {
    return this.def.img != null;
  }
};

module.exports = Yalbum;

},{"1":5,"2":2}],5:[function(require,module,exports){
var Ymg;

Ymg = function(yalbum, def) {
  this.def = def;
  this.id = def.id.split(':').reverse()[0];
  return this.path = yalbum.fullPath();
};

Ymg.prototype = {
  fullPath: function() {
    return "" + this.path + "/" + this.id;
  }
};

module.exports = Ymg;

},{}],6:[function(require,module,exports){
var Yalbum, Yuser, jsonp;

Yalbum = require(2);

jsonp = require(1);

Yuser = function(name, options) {
  var findId, makeYalbums;
  this.name = name;
  jsonp({
    url: "http://api-fotki.yandex.ru/api/users/" + (escape(name)) + "/?format=json",
    error: (function(_this) {
      return function() {
        var _ref;
        return (_ref = options.error) != null ? _ref.call(_this) : void 0;
      };
    })(this),
    success: (function(_this) {
      return function(data) {
        _this.service = data;
        return jsonp({
          url: data.collections['album-list'].href + '?format=json',
          error: function() {
            var _ref;
            return (_ref = options.error) != null ? _ref.call(_this) : void 0;
          },
          success: function(data) {
            var _ref;
            _this.albums = data;
            findId();
            _this.yalbums = makeYalbums();
            return (_ref = options.success) != null ? _ref.call(_this) : void 0;
          }
        });
      };
    })(this)
  });
  findId = (function(_this) {
    return function() {
      var a, _i, _len, _ref;
      _ref = _this.albums.authors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        if (a.name === _this.name) {
          return _this.id = a.uid;
        }
      }
    };
  })(this);
  return makeYalbums = (function(_this) {
    return function() {
      var a, _i, _len, _ref, _results;
      _ref = _this.albums.entries;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        _results.push(new Yalbum(_this, a));
      }
      return _results;
    };
  })(this);
};

module.exports = Yuser;

},{"1":2,"2":4}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVGVtcFxcZ2l0XFxmb3RreVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVGVtcC9naXQvZm90a3kvbm9kZV9tb2R1bGVzL3dpdGhvdXQvd2l0aG91dC5qcyIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy9qc29ucC5jb2ZmZWUiLCJDOi9UZW1wL2dpdC9mb3RreS9zcmMvbWFpbi5jb2ZmZWUiLCJDOi9UZW1wL2dpdC9mb3RreS9zcmMveWFsYnVtLmNvZmZlZSIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy95bWcuY29mZmVlIiwiQzovVGVtcC9naXQvZm90a3kvc3JjL3l1c2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9cclxuLy8gd2l0aG91dC5qcyAtIENvZmZlU2NyaXB0IHRlbXBsYXRlIGVuZ2luZSB3aXRoIGxleGljYWwgc2NvcGluZ1xyXG4vL1xyXG5cclxuKGZ1bmN0aW9uKClcclxue1xyXG4gIHZhclxyXG4gICAgblRhZ3M9J2EgYWJiciBhY3JvbnltIGFkZHJlc3MgYXBwbGV0IGFydGljbGUgYXNpZGUgYXVkaW8gYiBiZG8gYmlnIGJsb2NrcXVvdGUgYm9keSBidXR0b24gXFxcclxuY2FudmFzIGNhcHRpb24gY2VudGVyIGNpdGUgY29kZSBjb2xncm91cCBjb21tYW5kIGRhdGFsaXN0IGRkIGRlbCBkZXRhaWxzIGRmbiBkaXIgZGl2IGRsIGR0IFxcXHJcbmVtIGVtYmVkIGZpZWxkc2V0IGZpZ2NhcHRpb24gZmlndXJlIGZvbnQgZm9vdGVyIGZvcm0gZnJhbWVzZXQgaDEgaDIgaDMgaDQgaDUgaDYgaGVhZCBoZWFkZXIgaGdyb3VwIGh0bWwgXFxcclxuaSBpZnJhbWUgaW5zIGtleWdlbiBrYmQgbGFiZWwgbGVnZW5kIGxpIG1hcCBtYXJrIG1lbnUgbWV0ZXIgbmF2IG5vZnJhbWVzIG5vc2NyaXB0IG9iamVjdCBcXFxyXG5vbCBvcHRncm91cCBvcHRpb24gb3V0cHV0IHAgcHJlIHByb2dyZXNzIHEgcnAgcnQgcnVieSBcXFxyXG5zIHNhbXAgc2NyaXB0IHNlY3Rpb24gc2VsZWN0IHNtYWxsIHNvdXJjZSBzcGFuIHN0cmlrZSBzdHJvbmcgc3R5bGUgc3ViIHN1bW1hcnkgc3VwIFxcXHJcbnRhYmxlIHRib2R5IHRkIHRleHRhcmVhIHRmb290IHRoIHRoZWFkIHRpbWUgdGl0bGUgdHIgdHQgdSB1bCB2aWRlbyB3YnIgeG1wJy5zcGxpdCgnICcpLFxyXG4gICAgZVRhZ3M9J2FyZWEgYmFzZSBiYXNlZm9udCBiciBjb2wgZnJhbWUgaHIgaW1nIGlucHV0IGxpbmsgbWV0YSBwYXJhbScuc3BsaXQoJyAnKSxcclxuICAgIGh0bWxFbnRpdGllcz17JyYnOiAnJmFtcDsnLCAnPCc6ICcmbHQ7JywgJz4nOiAnJmd0OycsICdcIic6ICcmcXVvdDsnfSxcclxuICAgIHNsaWNlPVtdLnNsaWNlLFxyXG4gICAgc2NvcGU9e30sXHJcbiAgICBodG1sPScnLFxyXG4gICAgX3RoaXNcclxuXHJcbiAgZnVuY3Rpb24gaChzKVxyXG4gIHtcclxuICAgIHJldHVybiBTdHJpbmcocykucmVwbGFjZSgvWyY8PlwiXS9nLCBmdW5jdGlvbihlKXtyZXR1cm4gaHRtbEVudGl0aWVzW2VdfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNoaWxkcmVuKGEpXHJcbiAge1xyXG4gICAgdmFyIGksIGVcclxuICAgIGZvcihpPTA7IGk8YS5sZW5ndGg7IGkrKylcclxuICAgIHtcclxuICAgICAgaWYobnVsbD09KGU9YVtpXSkpIGNvbnRpbnVlO1xyXG4gICAgICBpZignZnVuY3Rpb24nPT10eXBlb2YgZSlcclxuICAgICAgICBlLmNhbGwoX3RoaXMpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBodG1sKz1oKGUpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwcmludChhKVxyXG4gIHtcclxuICAgIHZhciBpLCBlXHJcbiAgICBmb3IoaT0wOyBpPGEubGVuZ3RoOyBpKyspIGlmKG51bGwhPShlPWFbaV0pKSBodG1sKz1oKGUpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByYXcoYSlcclxuICB7XHJcbiAgICB2YXIgaSwgZVxyXG4gICAgZm9yKGk9MDsgaTxhLmxlbmd0aDsgaSsrKSBpZihudWxsIT0oZT1hW2ldKSkgaHRtbCs9ZVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWFrZVRhZyhuYW1lLCBlbXB0eSlcclxuICB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXt0YWcoYXJndW1lbnRzKX1cclxuICAgIGZ1bmN0aW9uIGF0dHIoaywgdilcclxuICAgIHtcclxuICAgICAgaWYobnVsbD09diB8fCBmYWxzZT09PXYpIHJldHVyblxyXG4gICAgICBodG1sKz0nICcraChrKVxyXG4gICAgICBpZih0cnVlIT09dikgaHRtbCs9Jz1cIicraCh2KSsnXCInXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBuZXN0KHByZWZpeCwgb2JqKVxyXG4gICAge1xyXG4gICAgICBmb3IodmFyIGsgaW4gb2JqKVxyXG4gICAgICAgIGlmKCdvYmplY3QnPT10eXBlb2Ygb2JqW2tdKVxyXG4gICAgICAgICAgbmVzdChwcmVmaXgraysnLScsIG9ialtrXSlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBhdHRyKHByZWZpeCtrLCBvYmpba10pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0YWcoYSlcclxuICAgIHtcclxuICAgICAgaHRtbCs9JzwnK25hbWVcclxuICAgICAgdmFyIGF0PWFbMF1cclxuICAgICAgaWYoJ29iamVjdCc9PXR5cGVvZiBhdClcclxuICAgICAge1xyXG4gICAgICAgZm9yKHZhciBrIGluIGF0KVxyXG4gICAgICAgICBpZignZGF0YSc9PWsgJiYgJ29iamVjdCc9PXR5cGVvZiBhdFtrXSlcclxuICAgICAgICAgICBuZXN0KCdkYXRhLScsIGF0W2tdKVxyXG4gICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgYXR0cihrLCBhdFtrXSlcclxuICAgICAgIGE9c2xpY2UuY2FsbChhLCAxKVxyXG4gICAgICB9XHJcbiAgICAgIGh0bWwrPSc+J1xyXG4gICAgICBpZihlbXB0eSAmJiBhLmxlbmd0aCkgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiPFwiK25hbWUrXCI+IG11c3QgaGF2ZSBubyBjb250ZW50IVwiKVxyXG4gICAgICBpZihlbXB0eSkgcmV0dXJuXHJcbiAgICAgIGNoaWxkcmVuKGEpXHJcbiAgICAgIGh0bWwrPVwiPC9cIituYW1lK1wiPlwiXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYWtlQ29tbWVudCgpXHJcbiAge1xyXG4gICAgdmFyIGxldmVsPTA7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXsgY29tbWVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpIH1cclxuICAgIGZ1bmN0aW9uIGNvbW1lbnQoKVxyXG4gICAge1xyXG4gICAgICBodG1sKz0gbGV2ZWwrKz8gJzxjb21tZW50IGxldmVsPVwiJytsZXZlbCsnXCI+JyA6IFwiPCEtLSBcIlxyXG4gICAgICBjaGlsZHJlbihhcmd1bWVudHMpXHJcbiAgICAgIGh0bWwrPSAtLWxldmVsPyAnPC9jb21tZW50Pic6ICcgLS0+J1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29mZmVlU2NyaXB0KClcclxuICB7XHJcbiAgICBpZigxIT1hcmd1bWVudHMubGVuZ3RoIHx8J2Z1bmN0aW9uJyE9dHlwZW9mIGFyZ3VtZW50c1swXSlcclxuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdVc2FnZTogY29mZmVlc2NyaXB0IC0+IGNvZGUnKVxyXG4gICAgaHRtbCs9JzxzY3JpcHQ+PCEtLVxcbignK2FyZ3VtZW50c1swXS50b1N0cmluZygpKycpKClcXG4vLy0tPlxcbjwvc2NyaXB0Pic7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGhvY1RhZygpXHJcbiAge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG5hbWUsIGVtcHR5KXsgcmV0dXJuIHRhZyhuYW1lLCBlbXB0eSkgfVxyXG4gICAgZnVuY3Rpb24gaXNFbXB0eShuYW1lKVxyXG4gICAge1xyXG4gICAgICBmb3IodmFyIGkgaW4gZVRhZ3MpIGlmKG5hbWU9PWVUYWdzW2ldKSByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gdGFnKG5hbWUsIGVtcHR5KVxyXG4gICAge1xyXG4gICAgICByZXR1cm4gbWFrZVRhZyhuYW1lLCBudWxsPT1lbXB0eT8gaXNFbXB0eShTdHJpbmcobmFtZSkudG9Mb3dlckNhc2UoKSkgOiBlbXB0eSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG5vVGFnKGF0dHJzKVxyXG4gIHtcclxuICAgIGNoaWxkcmVuKCdvYmplY3QnPT10eXBlb2YgYXR0cnMgPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBhcmd1bWVudHMpXHJcbiAgfVxyXG5cclxuICBzY29wZS5wcmludD1zY29wZS50ZXh0PWZ1bmN0aW9uKCl7cHJpbnQoYXJndW1lbnRzKX1cclxuICBzY29wZS5yYXc9ZnVuY3Rpb24oKXtyYXcoYXJndW1lbnRzKX1cclxuICBzY29wZS50YWc9YWRob2NUYWcoKVxyXG4gIHNjb3BlLm5vdGFnPWZ1bmN0aW9uKCl7bm9UYWcuYXBwbHkodGhpcywgYXJndW1lbnRzKX1cclxuICBzY29wZS5jb21tZW50PW1ha2VDb21tZW50KClcclxuICBzY29wZS5ibGFja2hvbGU9ZnVuY3Rpb24oKXt9XHJcbiAgc2NvcGUuY29mZmVlc2NyaXB0PWZ1bmN0aW9uKCl7IGNvZmZlZVNjcmlwdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpIH1cclxuXHJcbiAgZm9yKHZhciBpIGluIG5UYWdzKSBzY29wZVtuVGFnc1tpXV09bWFrZVRhZyhuVGFnc1tpXSlcclxuICBzY29wZS4kdmFyPW1ha2VUYWcoJ3ZhcicpXHJcbiAgZm9yKHZhciBpIGluIGVUYWdzKSBzY29wZVtlVGFnc1tpXV09bWFrZVRhZyhlVGFnc1tpXSwgdHJ1ZSlcclxuXHJcbiAgZnVuY3Rpb24gbWFrZVZhcnMoKVxyXG4gIHtcclxuICAgIHZhciB2PVtdO1xyXG4gICAgZm9yKHZhciB0YWcgaW4gc2NvcGUpIHYucHVzaCh0YWcrJz10aGlzLicrdGFnKVxyXG4gICAgcmV0dXJuICd2YXIgJyt2LmpvaW4oJywnKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2V0Q29udGV4dChmbil7XHJcbiAgICByZXR1cm4gKG5ldyBGdW5jdGlvbihtYWtlVmFycygpKydcXG5yZXR1cm4gJytmbi50b1N0cmluZygpKSkuY2FsbChzY29wZSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlcmFibGUoZm4pXHJcbiAge1xyXG4gICAgaWYoJ2Z1bmN0aW9uJyE9dHlwZW9mIGZuKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2FsbDogd2l0aE91dC5jb21waWxlKGZ1bmN0aW9uKVwiKTtcclxuICAgIHZhciBwZW5kaW5nPXRydWVcclxuICAgIHJldHVybiBmdW5jdGlvbigpXHJcbiAgICB7XHJcbiAgICAgIGlmKHBlbmRpbmcpXHJcbiAgICAgIHtcclxuICAgICAgICBmbj1zZXRDb250ZXh0KGZuKVxyXG4gICAgICAgIHBlbmRpbmc9ZmFsc2VcclxuICAgICAgfVxyXG4gICAgICB0cnlcclxuICAgICAge1xyXG4gICAgICAgIHZhciB0aGF0PV90aGlzLCB4PWh0bWxcclxuICAgICAgICBfdGhpcz10aGlzXHJcbiAgICAgICAgaHRtbD0nJ1xyXG4gICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcclxuICAgICAgICByZXR1cm4gaHRtbFxyXG4gICAgICB9XHJcbiAgICAgIGZpbmFsbHlcclxuICAgICAge1xyXG4gICAgICAgIF90aGlzPXRoYXRcclxuICAgICAgICBodG1sPXhcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29tcGlsZShmbilcclxuICB7XHJcbiAgICB2YXIgd2l0aE91dD1yZW5kZXJhYmxlKGZuKTtcclxuICAgIHJldHVybiBmdW5jdGlvbigpe3JldHVybiB3aXRoT3V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyl9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiAkY29tcGlsZShmbilcclxuICB7XHJcbiAgICB2YXIgd2l0aE91dD1yZW5kZXJhYmxlKGZuKTtcclxuICAgIHJldHVybiBmdW5jdGlvbigpe3JldHVybiB3aXRoT3V0LmFwcGx5KGFyZ3VtZW50c1swXSwgYXJndW1lbnRzKX1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZsYXR0ZW4oYXJyYXkpXHJcbiAge1xyXG4gICAgdmFyIHYsIHI9W11cclxuICAgIGZvcih2YXIgaSBpbiBhcnJheSlcclxuICAgICAgaWYoJ29iamVjdCc9PXR5cGVvZih2PWFycmF5W2ldKSlcclxuICAgICAgICByLnB1c2guYXBwbHkociwgZmxhdHRlbih2KSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHIucHVzaCh2KVxyXG4gICAgcmV0dXJuIHJcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZldGNoSlNUcyhwYXRocylcclxuICB7XHJcbiAgICB2YXIgdlxyXG4gICAgZm9yKHZhciBpIGluIHBhdGhzKVxyXG4gICAge1xyXG4gICAgICBpZignZnVuY3Rpb24nIT10eXBlb2Yodj1wYXRoc1tpXSkgJiZcclxuICAgICAgICAgJ2Z1bmN0aW9uJyE9dHlwZW9mKHY9SlNUW3ZdKSlcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJKU1RbJ1wiK3BhdGhzW2ldK1wiJ10gbm90IGZvdW5kIG9yIGluY29ycmVjdCFcIilcclxuICAgICAgcGF0aHNbaV09cmVuZGVyYWJsZSh2KVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhdGhzXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBKU1RzKHBhdGgpXHJcbiAge1xyXG4gICAgdmFyIGJvdW5kLCBUcz1mbGF0dGVuKHNsaWNlLmNhbGwoYXJndW1lbnRzKSlcclxuICAgIHJldHVybiBmdW5jdGlvbigpe3JldHVybiBKU1RzLmFwcGx5KGFyZ3VtZW50c1swXSwgYXJndW1lbnRzKX1cclxuICAgIGZ1bmN0aW9uIEpTVHMoKVxyXG4gICAge1xyXG4gICAgICB2YXIgUz0nJ1xyXG4gICAgICBpZighYm91bmQpXHJcbiAgICAgIHtcclxuICAgICAgICBUcz1mZXRjaEpTVHMoVHMpXHJcbiAgICAgICAgYm91bmQ9dHJ1ZVxyXG4gICAgICB9XHJcbiAgICAgIGZvcih2YXIgaSBpbiBUcykgUys9VHNbaV0uYXBwbHkodGhpcywgYXJndW1lbnRzKVxyXG4gICAgICByZXR1cm4gU1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIGludGVyZmFjZT17XHJcbiAgICBjb21waWxlOiBjb21waWxlLFxyXG4gICAgcmVuZGVyYWJsZTogY29tcGlsZSxcclxuICAgICRjb21waWxlOiAkY29tcGlsZSxcclxuICAgIEpTVHM6IEpTVHNcclxuICB9XHJcbiAgaWYoJ3VuZGVmaW5lZCchPXR5cGVvZiBtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpXHJcbiAgICBtb2R1bGUuZXhwb3J0cz1pbnRlcmZhY2VcclxuICBlbHNlIGlmKCdmdW5jdGlvbic9PXR5cGVvZiBkZWZpbmUgJiYgZGVmaW5lLmFtZClcclxuICAgIGRlZmluZShpbnRlcmZhY2UpXHJcbiAgZWxzZVxyXG4gICAgdGhpcy53aXRoT3V0PWludGVyZmFjZVxyXG59KSgpXHJcblxyXG4vLy0tW0VPRl0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIiwidmFyIHJhbmRvbTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciBDbGVhciwgRXJyb3IsIGNhbGxiYWNrLCBjYm5hbWUsIGpzLCB0aW1lb3V0LCB1cmw7XG4gIHVybCA9IG9wdGlvbnMudXJsLCBjYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2ssIHRpbWVvdXQgPSBvcHRpb25zLnRpbWVvdXQ7XG4gIGNhbGxiYWNrIHx8IChjYWxsYmFjayA9ICdjYWxsYmFjaycpO1xuICB0aW1lb3V0IHx8ICh0aW1lb3V0ID0gMzAwMCk7XG4gIHdoaWxlICh3aW5kb3dbY2JuYW1lID0gXCJfXCIgKyAocmFuZG9tKDE1KSldKSB7fVxuICB3aW5kb3dbY2JuYW1lXSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoQ2xlYXIoKSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvcHRpb25zLnN1Y2Nlc3MgPT09IFwiZnVuY3Rpb25cIiA/IG9wdGlvbnMuc3VjY2VzcyhkYXRhKSA6IHZvaWQgMDtcbiAgICB9XG4gIH07XG4gIEVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKENsZWFyKCkpIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb3B0aW9ucy5lcnJvciA9PT0gXCJmdW5jdGlvblwiID8gb3B0aW9ucy5lcnJvcigpIDogdm9pZCAwO1xuICAgIH1cbiAgfTtcbiAganMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAganMuYXN5bmMgPSB0cnVlO1xuICBqcy5vbmVycm9yID0gRXJyb3I7XG4gIGpzLnNyYyA9IFwiXCIgKyB1cmwgKyAodXJsLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArIGNhbGxiYWNrICsgXCI9XCIgKyBjYm5hbWU7XG4gIChkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0pLmFwcGVuZENoaWxkKGpzKTtcbiAgc2V0VGltZW91dChFcnJvciwgdGltZW91dCk7XG4gIENsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFqcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkZWxldGUgd2luZG93W2NibmFtZV07XG4gICAganMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChqcyk7XG4gICAganMgPSBudWxsO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xufTtcblxucmFuZG9tID0gZnVuY3Rpb24ocSkge1xuICB2YXIgbiwgcztcbiAgaWYgKHEgPT0gbnVsbCkge1xuICAgIHEgPSAxO1xuICB9XG4gIHMgPSAnJztcbiAgd2hpbGUgKHMubGVuZ3RoIDwgcSkge1xuICAgIG4gPSBNYXRoLmZsb29yKDYyICogTWF0aC5yYW5kb20oKSk7XG4gICAgcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKG4gJSAyNiArICdBYTAnLmNoYXJDb2RlQXQobiAvIDI2KSk7XG4gIH1cbiAgcmV0dXJuIHM7XG59O1xuIiwidmFyIFl1c2VyLCBsb2FkLCByZW5kZXIsIHQsIHUsIHdpdGhPdXQ7XG5cbndpdGhPdXQgPSByZXF1aXJlKDIpO1xuXG5ZdXNlciA9IHJlcXVpcmUoMSk7XG5cbnUgPSBuZXcgWXVzZXIoJ3N0YW5pc2xhdi11a29sb3YnLCB7XG4gIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhLCBfaSwgX2xlbiwgX3JlZjtcbiAgICBfcmVmID0gdGhpcy55YWxidW1zO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgYSA9IF9yZWZbX2ldO1xuICAgICAgaWYgKGEuZGVmLmltZykge1xuICAgICAgICBsb2FkKGEpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb25zb2xlLmxvZygnTm8gYWxidW1zIGZvdW5kJyk7XG4gIH1cbn0pO1xuXG5sb2FkID0gZnVuY3Rpb24oYSkge1xuICByZXR1cm4gYS5sb2FkUGhvdG9zKHtcbiAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coJ09vcHMnKTtcbiAgICB9LFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlbmRlcih0aGlzKTtcbiAgICB9XG4gIH0pO1xufTtcblxucmVuZGVyID0gZnVuY3Rpb24oeWFsYnVtKSB7XG4gIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm90a3knKS5pbm5lckhUTUwgPSB0KHlhbGJ1bS55bWdzKTtcbn07XG5cbnQgPSB3aXRoT3V0LiRjb21waWxlKGZ1bmN0aW9uKGxpc3QsIHNpemUpIHtcbiAgdmFyIHksIHl6LCBfaSwgX2xlbjtcbiAgaWYgKHNpemUgPT0gbnVsbCkge1xuICAgIHNpemUgPSAnUyc7XG4gIH1cbiAgZm9yIChfaSA9IDAsIF9sZW4gPSBsaXN0Lmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgeSA9IGxpc3RbX2ldO1xuICAgIHl6ID0geS5kZWYuaW1nW3NpemVdO1xuICAgIGRpdih7XG4gICAgICBcImNsYXNzXCI6ICd0aHVtYm5haWwnXG4gICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYSh7XG4gICAgICAgIHN0eWxlOiBcIndpZHRoOiBcIiArIHl6LndpZHRoICsgXCJweDtcIixcbiAgICAgICAgaHJlZjogXCIjXCIgKyAoeS5mdWxsUGF0aCgpKSxcbiAgICAgICAgdGl0bGU6IHkuZGVmLnRpdGxlIHx8IG51bGxcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICBpbWcoe1xuICAgICAgICAgIHNyYzogeXouaHJlZlxuICAgICAgICB9KTtcbiAgICAgICAgZGl2KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBiKHkuZGVmLnRpdGxlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkaXYoe1xuICAgICAgICAgIHRpdGxlOiB5LmRlZi5zdW1tYXJ5IHx8IG51bGxcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHNtYWxsKHkuZGVmLnN1bW1hcnkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59KTtcbiIsInZhciBZYWxidW0sIFltZywganNvbnA7XG5cblltZyA9IHJlcXVpcmUoMSk7XG5cbmpzb25wID0gcmVxdWlyZSgyKTtcblxuWWFsYnVtID0gZnVuY3Rpb24oeXVzZXIsIGRlZikge1xuICB0aGlzLmRlZiA9IGRlZjtcbiAgdGhpcy5pZCA9IGRlZi5pZC5zcGxpdCgnOicpLnJldmVyc2UoKVswXTtcbiAgcmV0dXJuIHRoaXMucGF0aCA9IHl1c2VyLmlkO1xufTtcblxuWWFsYnVtLnByb3RvdHlwZSA9IHtcbiAgbG9hZFBob3RvczogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghdGhpcy52aXNpYmxlKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIGpzb25wKHtcbiAgICAgIHVybDogdGhpcy5kZWYubGlua3MucGhvdG9zLFxuICAgICAgc3VjY2VzczogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIHksIF9yZWY7XG4gICAgICAgICAgX3RoaXMueW1ncyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgICAgICBfcmVmID0gKHRoaXMucGhvdG9zID0gZGF0YSkuZW50cmllcztcbiAgICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgeSA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKG5ldyBZbWcodGhpcywgeSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICAgIH0pLmNhbGwoX3RoaXMpO1xuICAgICAgICAgIHJldHVybiAoX3JlZiA9IG9wdGlvbnMuc3VjY2VzcykgIT0gbnVsbCA/IF9yZWYuY2FsbChfdGhpcykgOiB2b2lkIDA7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSxcbiAgICAgIGVycm9yOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBfcmVmO1xuICAgICAgICAgIHJldHVybiAoX3JlZiA9IG9wdGlvbnMuZXJyb3IpICE9IG51bGwgPyBfcmVmLmNhbGwoX3RoaXMpIDogdm9pZCAwO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcylcbiAgICB9KTtcbiAgfSxcbiAgZnVsbFBhdGg6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIlwiICsgdGhpcy5wYXRoICsgXCIvXCIgKyB0aGlzLmlkO1xuICB9LFxuICB2aXNpYmxlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kZWYuaW1nICE9IG51bGw7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gWWFsYnVtO1xuIiwidmFyIFltZztcblxuWW1nID0gZnVuY3Rpb24oeWFsYnVtLCBkZWYpIHtcbiAgdGhpcy5kZWYgPSBkZWY7XG4gIHRoaXMuaWQgPSBkZWYuaWQuc3BsaXQoJzonKS5yZXZlcnNlKClbMF07XG4gIHJldHVybiB0aGlzLnBhdGggPSB5YWxidW0uZnVsbFBhdGgoKTtcbn07XG5cblltZy5wcm90b3R5cGUgPSB7XG4gIGZ1bGxQYXRoOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJcIiArIHRoaXMucGF0aCArIFwiL1wiICsgdGhpcy5pZDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBZbWc7XG4iLCJ2YXIgWWFsYnVtLCBZdXNlciwganNvbnA7XG5cbllhbGJ1bSA9IHJlcXVpcmUoMik7XG5cbmpzb25wID0gcmVxdWlyZSgxKTtcblxuWXVzZXIgPSBmdW5jdGlvbihuYW1lLCBvcHRpb25zKSB7XG4gIHZhciBmaW5kSWQsIG1ha2VZYWxidW1zO1xuICB0aGlzLm5hbWUgPSBuYW1lO1xuICBqc29ucCh7XG4gICAgdXJsOiBcImh0dHA6Ly9hcGktZm90a2kueWFuZGV4LnJ1L2FwaS91c2Vycy9cIiArIChlc2NhcGUobmFtZSkpICsgXCIvP2Zvcm1hdD1qc29uXCIsXG4gICAgZXJyb3I6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgcmV0dXJuIChfcmVmID0gb3B0aW9ucy5lcnJvcikgIT0gbnVsbCA/IF9yZWYuY2FsbChfdGhpcykgOiB2b2lkIDA7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpLFxuICAgIHN1Y2Nlc3M6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgX3RoaXMuc2VydmljZSA9IGRhdGE7XG4gICAgICAgIHJldHVybiBqc29ucCh7XG4gICAgICAgICAgdXJsOiBkYXRhLmNvbGxlY3Rpb25zWydhbGJ1bS1saXN0J10uaHJlZiArICc/Zm9ybWF0PWpzb24nLFxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBfcmVmO1xuICAgICAgICAgICAgcmV0dXJuIChfcmVmID0gb3B0aW9ucy5lcnJvcikgIT0gbnVsbCA/IF9yZWYuY2FsbChfdGhpcykgOiB2b2lkIDA7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgICAgIF90aGlzLmFsYnVtcyA9IGRhdGE7XG4gICAgICAgICAgICBmaW5kSWQoKTtcbiAgICAgICAgICAgIF90aGlzLnlhbGJ1bXMgPSBtYWtlWWFsYnVtcygpO1xuICAgICAgICAgICAgcmV0dXJuIChfcmVmID0gb3B0aW9ucy5zdWNjZXNzKSAhPSBudWxsID8gX3JlZi5jYWxsKF90aGlzKSA6IHZvaWQgMDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKVxuICB9KTtcbiAgZmluZElkID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGEsIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgX3JlZiA9IF90aGlzLmFsYnVtcy5hdXRob3JzO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGEgPSBfcmVmW19pXTtcbiAgICAgICAgaWYgKGEubmFtZSA9PT0gX3RoaXMubmFtZSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5pZCA9IGEudWlkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfSkodGhpcyk7XG4gIHJldHVybiBtYWtlWWFsYnVtcyA9IChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVmID0gX3RoaXMuYWxidW1zLmVudHJpZXM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGEgPSBfcmVmW19pXTtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChuZXcgWWFsYnVtKF90aGlzLCBhKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfSkodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFl1c2VyO1xuIl19
