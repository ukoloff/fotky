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
var checkHash, prev, startHistory, t, withOut;

withOut = require(1);

prev = null;

checkHash = function() {
  var hash;
  hash = /#(.*)|$/.exec(location.href)[1] || '';
  if (prev === hash) {
    return;
  }
  prev = hash;
  return document.getElementById('hash').innerHTML = t(hash);
};

t = withOut.$compile(function() {
  b('Hash: ');
  return text(this);
});

startHistory = function() {
  checkHash();
  if ('onhashchange' in window) {
    return window.onhashchange = checkHash;
  } else {
    return window.setInterval(checkHash, 50);
  }
};

module.exports = startHistory;

},{"1":1}],3:[function(require,module,exports){
var jsonp, random;

jsonp = function(options) {
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

module.exports = jsonp;

},{}],4:[function(require,module,exports){
var Yuser, history, load, render, t, u, withOut;

withOut = require(3);

Yuser = require(1);

history = require(2);

setTimeout(history);

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

},{"1":7,"2":2,"3":1}],5:[function(require,module,exports){
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

},{"1":6,"2":3}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"1":3,"2":5}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVGVtcFxcZ2l0XFxmb3RreVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVGVtcC9naXQvZm90a3kvbm9kZV9tb2R1bGVzL3dpdGhvdXQvd2l0aG91dC5qcyIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy9oaXN0b3J5LmNvZmZlZSIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy9qc29ucC5jb2ZmZWUiLCJDOi9UZW1wL2dpdC9mb3RreS9zcmMvbWFpbi5jb2ZmZWUiLCJDOi9UZW1wL2dpdC9mb3RreS9zcmMveWFsYnVtLmNvZmZlZSIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy95bWcuY29mZmVlIiwiQzovVGVtcC9naXQvZm90a3kvc3JjL3l1c2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9cclxuLy8gd2l0aG91dC5qcyAtIENvZmZlU2NyaXB0IHRlbXBsYXRlIGVuZ2luZSB3aXRoIGxleGljYWwgc2NvcGluZ1xyXG4vL1xyXG5cclxuKGZ1bmN0aW9uKClcclxue1xyXG4gIHZhclxyXG4gICAgblRhZ3M9J2EgYWJiciBhY3JvbnltIGFkZHJlc3MgYXBwbGV0IGFydGljbGUgYXNpZGUgYXVkaW8gYiBiZG8gYmlnIGJsb2NrcXVvdGUgYm9keSBidXR0b24gXFxcclxuY2FudmFzIGNhcHRpb24gY2VudGVyIGNpdGUgY29kZSBjb2xncm91cCBjb21tYW5kIGRhdGFsaXN0IGRkIGRlbCBkZXRhaWxzIGRmbiBkaXIgZGl2IGRsIGR0IFxcXHJcbmVtIGVtYmVkIGZpZWxkc2V0IGZpZ2NhcHRpb24gZmlndXJlIGZvbnQgZm9vdGVyIGZvcm0gZnJhbWVzZXQgaDEgaDIgaDMgaDQgaDUgaDYgaGVhZCBoZWFkZXIgaGdyb3VwIGh0bWwgXFxcclxuaSBpZnJhbWUgaW5zIGtleWdlbiBrYmQgbGFiZWwgbGVnZW5kIGxpIG1hcCBtYXJrIG1lbnUgbWV0ZXIgbmF2IG5vZnJhbWVzIG5vc2NyaXB0IG9iamVjdCBcXFxyXG5vbCBvcHRncm91cCBvcHRpb24gb3V0cHV0IHAgcHJlIHByb2dyZXNzIHEgcnAgcnQgcnVieSBcXFxyXG5zIHNhbXAgc2NyaXB0IHNlY3Rpb24gc2VsZWN0IHNtYWxsIHNvdXJjZSBzcGFuIHN0cmlrZSBzdHJvbmcgc3R5bGUgc3ViIHN1bW1hcnkgc3VwIFxcXHJcbnRhYmxlIHRib2R5IHRkIHRleHRhcmVhIHRmb290IHRoIHRoZWFkIHRpbWUgdGl0bGUgdHIgdHQgdSB1bCB2aWRlbyB3YnIgeG1wJy5zcGxpdCgnICcpLFxyXG4gICAgZVRhZ3M9J2FyZWEgYmFzZSBiYXNlZm9udCBiciBjb2wgZnJhbWUgaHIgaW1nIGlucHV0IGxpbmsgbWV0YSBwYXJhbScuc3BsaXQoJyAnKSxcclxuICAgIGh0bWxFbnRpdGllcz17JyYnOiAnJmFtcDsnLCAnPCc6ICcmbHQ7JywgJz4nOiAnJmd0OycsICdcIic6ICcmcXVvdDsnfSxcclxuICAgIHNsaWNlPVtdLnNsaWNlLFxyXG4gICAgc2NvcGU9e30sXHJcbiAgICBodG1sPScnLFxyXG4gICAgX3RoaXNcclxuXHJcbiAgZnVuY3Rpb24gaChzKVxyXG4gIHtcclxuICAgIHJldHVybiBTdHJpbmcocykucmVwbGFjZSgvWyY8PlwiXS9nLCBmdW5jdGlvbihlKXtyZXR1cm4gaHRtbEVudGl0aWVzW2VdfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNoaWxkcmVuKGEpXHJcbiAge1xyXG4gICAgdmFyIGksIGVcclxuICAgIGZvcihpPTA7IGk8YS5sZW5ndGg7IGkrKylcclxuICAgIHtcclxuICAgICAgaWYobnVsbD09KGU9YVtpXSkpIGNvbnRpbnVlO1xyXG4gICAgICBpZignZnVuY3Rpb24nPT10eXBlb2YgZSlcclxuICAgICAgICBlLmNhbGwoX3RoaXMpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBodG1sKz1oKGUpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwcmludChhKVxyXG4gIHtcclxuICAgIHZhciBpLCBlXHJcbiAgICBmb3IoaT0wOyBpPGEubGVuZ3RoOyBpKyspIGlmKG51bGwhPShlPWFbaV0pKSBodG1sKz1oKGUpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByYXcoYSlcclxuICB7XHJcbiAgICB2YXIgaSwgZVxyXG4gICAgZm9yKGk9MDsgaTxhLmxlbmd0aDsgaSsrKSBpZihudWxsIT0oZT1hW2ldKSkgaHRtbCs9ZVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWFrZVRhZyhuYW1lLCBlbXB0eSlcclxuICB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXt0YWcoYXJndW1lbnRzKX1cclxuICAgIGZ1bmN0aW9uIGF0dHIoaywgdilcclxuICAgIHtcclxuICAgICAgaWYobnVsbD09diB8fCBmYWxzZT09PXYpIHJldHVyblxyXG4gICAgICBodG1sKz0nICcraChrKVxyXG4gICAgICBpZih0cnVlIT09dikgaHRtbCs9Jz1cIicraCh2KSsnXCInXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBuZXN0KHByZWZpeCwgb2JqKVxyXG4gICAge1xyXG4gICAgICBmb3IodmFyIGsgaW4gb2JqKVxyXG4gICAgICAgIGlmKCdvYmplY3QnPT10eXBlb2Ygb2JqW2tdKVxyXG4gICAgICAgICAgbmVzdChwcmVmaXgraysnLScsIG9ialtrXSlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBhdHRyKHByZWZpeCtrLCBvYmpba10pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0YWcoYSlcclxuICAgIHtcclxuICAgICAgaHRtbCs9JzwnK25hbWVcclxuICAgICAgdmFyIGF0PWFbMF1cclxuICAgICAgaWYoJ29iamVjdCc9PXR5cGVvZiBhdClcclxuICAgICAge1xyXG4gICAgICAgZm9yKHZhciBrIGluIGF0KVxyXG4gICAgICAgICBpZignZGF0YSc9PWsgJiYgJ29iamVjdCc9PXR5cGVvZiBhdFtrXSlcclxuICAgICAgICAgICBuZXN0KCdkYXRhLScsIGF0W2tdKVxyXG4gICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgYXR0cihrLCBhdFtrXSlcclxuICAgICAgIGE9c2xpY2UuY2FsbChhLCAxKVxyXG4gICAgICB9XHJcbiAgICAgIGh0bWwrPSc+J1xyXG4gICAgICBpZihlbXB0eSAmJiBhLmxlbmd0aCkgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiPFwiK25hbWUrXCI+IG11c3QgaGF2ZSBubyBjb250ZW50IVwiKVxyXG4gICAgICBpZihlbXB0eSkgcmV0dXJuXHJcbiAgICAgIGNoaWxkcmVuKGEpXHJcbiAgICAgIGh0bWwrPVwiPC9cIituYW1lK1wiPlwiXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYWtlQ29tbWVudCgpXHJcbiAge1xyXG4gICAgdmFyIGxldmVsPTA7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXsgY29tbWVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpIH1cclxuICAgIGZ1bmN0aW9uIGNvbW1lbnQoKVxyXG4gICAge1xyXG4gICAgICBodG1sKz0gbGV2ZWwrKz8gJzxjb21tZW50IGxldmVsPVwiJytsZXZlbCsnXCI+JyA6IFwiPCEtLSBcIlxyXG4gICAgICBjaGlsZHJlbihhcmd1bWVudHMpXHJcbiAgICAgIGh0bWwrPSAtLWxldmVsPyAnPC9jb21tZW50Pic6ICcgLS0+J1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29mZmVlU2NyaXB0KClcclxuICB7XHJcbiAgICBpZigxIT1hcmd1bWVudHMubGVuZ3RoIHx8J2Z1bmN0aW9uJyE9dHlwZW9mIGFyZ3VtZW50c1swXSlcclxuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdVc2FnZTogY29mZmVlc2NyaXB0IC0+IGNvZGUnKVxyXG4gICAgaHRtbCs9JzxzY3JpcHQ+PCEtLVxcbignK2FyZ3VtZW50c1swXS50b1N0cmluZygpKycpKClcXG4vLy0tPlxcbjwvc2NyaXB0Pic7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGhvY1RhZygpXHJcbiAge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG5hbWUsIGVtcHR5KXsgcmV0dXJuIHRhZyhuYW1lLCBlbXB0eSkgfVxyXG4gICAgZnVuY3Rpb24gaXNFbXB0eShuYW1lKVxyXG4gICAge1xyXG4gICAgICBmb3IodmFyIGkgaW4gZVRhZ3MpIGlmKG5hbWU9PWVUYWdzW2ldKSByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gdGFnKG5hbWUsIGVtcHR5KVxyXG4gICAge1xyXG4gICAgICByZXR1cm4gbWFrZVRhZyhuYW1lLCBudWxsPT1lbXB0eT8gaXNFbXB0eShTdHJpbmcobmFtZSkudG9Mb3dlckNhc2UoKSkgOiBlbXB0eSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG5vVGFnKGF0dHJzKVxyXG4gIHtcclxuICAgIGNoaWxkcmVuKCdvYmplY3QnPT10eXBlb2YgYXR0cnMgPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBhcmd1bWVudHMpXHJcbiAgfVxyXG5cclxuICBzY29wZS5wcmludD1zY29wZS50ZXh0PWZ1bmN0aW9uKCl7cHJpbnQoYXJndW1lbnRzKX1cclxuICBzY29wZS5yYXc9ZnVuY3Rpb24oKXtyYXcoYXJndW1lbnRzKX1cclxuICBzY29wZS50YWc9YWRob2NUYWcoKVxyXG4gIHNjb3BlLm5vdGFnPWZ1bmN0aW9uKCl7bm9UYWcuYXBwbHkodGhpcywgYXJndW1lbnRzKX1cclxuICBzY29wZS5jb21tZW50PW1ha2VDb21tZW50KClcclxuICBzY29wZS5ibGFja2hvbGU9ZnVuY3Rpb24oKXt9XHJcbiAgc2NvcGUuY29mZmVlc2NyaXB0PWZ1bmN0aW9uKCl7IGNvZmZlZVNjcmlwdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpIH1cclxuXHJcbiAgZm9yKHZhciBpIGluIG5UYWdzKSBzY29wZVtuVGFnc1tpXV09bWFrZVRhZyhuVGFnc1tpXSlcclxuICBzY29wZS4kdmFyPW1ha2VUYWcoJ3ZhcicpXHJcbiAgZm9yKHZhciBpIGluIGVUYWdzKSBzY29wZVtlVGFnc1tpXV09bWFrZVRhZyhlVGFnc1tpXSwgdHJ1ZSlcclxuXHJcbiAgZnVuY3Rpb24gbWFrZVZhcnMoKVxyXG4gIHtcclxuICAgIHZhciB2PVtdO1xyXG4gICAgZm9yKHZhciB0YWcgaW4gc2NvcGUpIHYucHVzaCh0YWcrJz10aGlzLicrdGFnKVxyXG4gICAgcmV0dXJuICd2YXIgJyt2LmpvaW4oJywnKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2V0Q29udGV4dChmbil7XHJcbiAgICByZXR1cm4gKG5ldyBGdW5jdGlvbihtYWtlVmFycygpKydcXG5yZXR1cm4gJytmbi50b1N0cmluZygpKSkuY2FsbChzY29wZSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlcmFibGUoZm4pXHJcbiAge1xyXG4gICAgaWYoJ2Z1bmN0aW9uJyE9dHlwZW9mIGZuKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2FsbDogd2l0aE91dC5jb21waWxlKGZ1bmN0aW9uKVwiKTtcclxuICAgIHZhciBwZW5kaW5nPXRydWVcclxuICAgIHJldHVybiBmdW5jdGlvbigpXHJcbiAgICB7XHJcbiAgICAgIGlmKHBlbmRpbmcpXHJcbiAgICAgIHtcclxuICAgICAgICBmbj1zZXRDb250ZXh0KGZuKVxyXG4gICAgICAgIHBlbmRpbmc9ZmFsc2VcclxuICAgICAgfVxyXG4gICAgICB0cnlcclxuICAgICAge1xyXG4gICAgICAgIHZhciB0aGF0PV90aGlzLCB4PWh0bWxcclxuICAgICAgICBfdGhpcz10aGlzXHJcbiAgICAgICAgaHRtbD0nJ1xyXG4gICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcclxuICAgICAgICByZXR1cm4gaHRtbFxyXG4gICAgICB9XHJcbiAgICAgIGZpbmFsbHlcclxuICAgICAge1xyXG4gICAgICAgIF90aGlzPXRoYXRcclxuICAgICAgICBodG1sPXhcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29tcGlsZShmbilcclxuICB7XHJcbiAgICB2YXIgd2l0aE91dD1yZW5kZXJhYmxlKGZuKTtcclxuICAgIHJldHVybiBmdW5jdGlvbigpe3JldHVybiB3aXRoT3V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyl9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiAkY29tcGlsZShmbilcclxuICB7XHJcbiAgICB2YXIgd2l0aE91dD1yZW5kZXJhYmxlKGZuKTtcclxuICAgIHJldHVybiBmdW5jdGlvbigpe3JldHVybiB3aXRoT3V0LmFwcGx5KGFyZ3VtZW50c1swXSwgYXJndW1lbnRzKX1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZsYXR0ZW4oYXJyYXkpXHJcbiAge1xyXG4gICAgdmFyIHYsIHI9W11cclxuICAgIGZvcih2YXIgaSBpbiBhcnJheSlcclxuICAgICAgaWYoJ29iamVjdCc9PXR5cGVvZih2PWFycmF5W2ldKSlcclxuICAgICAgICByLnB1c2guYXBwbHkociwgZmxhdHRlbih2KSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHIucHVzaCh2KVxyXG4gICAgcmV0dXJuIHJcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZldGNoSlNUcyhwYXRocylcclxuICB7XHJcbiAgICB2YXIgdlxyXG4gICAgZm9yKHZhciBpIGluIHBhdGhzKVxyXG4gICAge1xyXG4gICAgICBpZignZnVuY3Rpb24nIT10eXBlb2Yodj1wYXRoc1tpXSkgJiZcclxuICAgICAgICAgJ2Z1bmN0aW9uJyE9dHlwZW9mKHY9SlNUW3ZdKSlcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJKU1RbJ1wiK3BhdGhzW2ldK1wiJ10gbm90IGZvdW5kIG9yIGluY29ycmVjdCFcIilcclxuICAgICAgcGF0aHNbaV09cmVuZGVyYWJsZSh2KVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhdGhzXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBKU1RzKHBhdGgpXHJcbiAge1xyXG4gICAgdmFyIGJvdW5kLCBUcz1mbGF0dGVuKHNsaWNlLmNhbGwoYXJndW1lbnRzKSlcclxuICAgIHJldHVybiBmdW5jdGlvbigpe3JldHVybiBKU1RzLmFwcGx5KGFyZ3VtZW50c1swXSwgYXJndW1lbnRzKX1cclxuICAgIGZ1bmN0aW9uIEpTVHMoKVxyXG4gICAge1xyXG4gICAgICB2YXIgUz0nJ1xyXG4gICAgICBpZighYm91bmQpXHJcbiAgICAgIHtcclxuICAgICAgICBUcz1mZXRjaEpTVHMoVHMpXHJcbiAgICAgICAgYm91bmQ9dHJ1ZVxyXG4gICAgICB9XHJcbiAgICAgIGZvcih2YXIgaSBpbiBUcykgUys9VHNbaV0uYXBwbHkodGhpcywgYXJndW1lbnRzKVxyXG4gICAgICByZXR1cm4gU1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIGludGVyZmFjZT17XHJcbiAgICBjb21waWxlOiBjb21waWxlLFxyXG4gICAgcmVuZGVyYWJsZTogY29tcGlsZSxcclxuICAgICRjb21waWxlOiAkY29tcGlsZSxcclxuICAgIEpTVHM6IEpTVHNcclxuICB9XHJcbiAgaWYoJ3VuZGVmaW5lZCchPXR5cGVvZiBtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpXHJcbiAgICBtb2R1bGUuZXhwb3J0cz1pbnRlcmZhY2VcclxuICBlbHNlIGlmKCdmdW5jdGlvbic9PXR5cGVvZiBkZWZpbmUgJiYgZGVmaW5lLmFtZClcclxuICAgIGRlZmluZShpbnRlcmZhY2UpXHJcbiAgZWxzZVxyXG4gICAgdGhpcy53aXRoT3V0PWludGVyZmFjZVxyXG59KSgpXHJcblxyXG4vLy0tW0VPRl0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIiwidmFyIGNoZWNrSGFzaCwgcHJldiwgc3RhcnRIaXN0b3J5LCB0LCB3aXRoT3V0O1xuXG53aXRoT3V0ID0gcmVxdWlyZSgxKTtcblxucHJldiA9IG51bGw7XG5cbmNoZWNrSGFzaCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaGFzaDtcbiAgaGFzaCA9IC8jKC4qKXwkLy5leGVjKGxvY2F0aW9uLmhyZWYpWzFdIHx8ICcnO1xuICBpZiAocHJldiA9PT0gaGFzaCkge1xuICAgIHJldHVybjtcbiAgfVxuICBwcmV2ID0gaGFzaDtcbiAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoYXNoJykuaW5uZXJIVE1MID0gdChoYXNoKTtcbn07XG5cbnQgPSB3aXRoT3V0LiRjb21waWxlKGZ1bmN0aW9uKCkge1xuICBiKCdIYXNoOiAnKTtcbiAgcmV0dXJuIHRleHQodGhpcyk7XG59KTtcblxuc3RhcnRIaXN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gIGNoZWNrSGFzaCgpO1xuICBpZiAoJ29uaGFzaGNoYW5nZScgaW4gd2luZG93KSB7XG4gICAgcmV0dXJuIHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSBjaGVja0hhc2g7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHdpbmRvdy5zZXRJbnRlcnZhbChjaGVja0hhc2gsIDUwKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdGFydEhpc3Rvcnk7XG4iLCJ2YXIganNvbnAsIHJhbmRvbTtcblxuanNvbnAgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciBDbGVhciwgRXJyb3IsIGNhbGxiYWNrLCBjYm5hbWUsIGpzLCB0aW1lb3V0LCB1cmw7XG4gIHVybCA9IG9wdGlvbnMudXJsLCBjYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2ssIHRpbWVvdXQgPSBvcHRpb25zLnRpbWVvdXQ7XG4gIGNhbGxiYWNrIHx8IChjYWxsYmFjayA9ICdjYWxsYmFjaycpO1xuICB0aW1lb3V0IHx8ICh0aW1lb3V0ID0gMzAwMCk7XG4gIHdoaWxlICh3aW5kb3dbY2JuYW1lID0gXCJfXCIgKyAocmFuZG9tKDE1KSldKSB7fVxuICB3aW5kb3dbY2JuYW1lXSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoQ2xlYXIoKSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvcHRpb25zLnN1Y2Nlc3MgPT09IFwiZnVuY3Rpb25cIiA/IG9wdGlvbnMuc3VjY2VzcyhkYXRhKSA6IHZvaWQgMDtcbiAgICB9XG4gIH07XG4gIEVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKENsZWFyKCkpIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb3B0aW9ucy5lcnJvciA9PT0gXCJmdW5jdGlvblwiID8gb3B0aW9ucy5lcnJvcigpIDogdm9pZCAwO1xuICAgIH1cbiAgfTtcbiAganMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAganMuYXN5bmMgPSB0cnVlO1xuICBqcy5vbmVycm9yID0gRXJyb3I7XG4gIGpzLnNyYyA9IFwiXCIgKyB1cmwgKyAodXJsLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArIGNhbGxiYWNrICsgXCI9XCIgKyBjYm5hbWU7XG4gIChkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0pLmFwcGVuZENoaWxkKGpzKTtcbiAgc2V0VGltZW91dChFcnJvciwgdGltZW91dCk7XG4gIENsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFqcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkZWxldGUgd2luZG93W2NibmFtZV07XG4gICAganMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChqcyk7XG4gICAganMgPSBudWxsO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xufTtcblxucmFuZG9tID0gZnVuY3Rpb24ocSkge1xuICB2YXIgbiwgcztcbiAgaWYgKHEgPT0gbnVsbCkge1xuICAgIHEgPSAxO1xuICB9XG4gIHMgPSAnJztcbiAgd2hpbGUgKHMubGVuZ3RoIDwgcSkge1xuICAgIG4gPSBNYXRoLmZsb29yKDYyICogTWF0aC5yYW5kb20oKSk7XG4gICAgcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKG4gJSAyNiArICdBYTAnLmNoYXJDb2RlQXQobiAvIDI2KSk7XG4gIH1cbiAgcmV0dXJuIHM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGpzb25wO1xuIiwidmFyIFl1c2VyLCBoaXN0b3J5LCBsb2FkLCByZW5kZXIsIHQsIHUsIHdpdGhPdXQ7XG5cbndpdGhPdXQgPSByZXF1aXJlKDMpO1xuXG5ZdXNlciA9IHJlcXVpcmUoMSk7XG5cbmhpc3RvcnkgPSByZXF1aXJlKDIpO1xuXG5zZXRUaW1lb3V0KGhpc3RvcnkpO1xuXG51ID0gbmV3IFl1c2VyKCdzdGFuaXNsYXYtdWtvbG92Jywge1xuICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYSwgX2ksIF9sZW4sIF9yZWY7XG4gICAgX3JlZiA9IHRoaXMueWFsYnVtcztcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIGEgPSBfcmVmW19pXTtcbiAgICAgIGlmIChhLmRlZi5pbWcpIHtcbiAgICAgICAgbG9hZChhKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29uc29sZS5sb2coJ05vIGFsYnVtcyBmb3VuZCcpO1xuICB9XG59KTtcblxubG9hZCA9IGZ1bmN0aW9uKGEpIHtcbiAgcmV0dXJuIGEubG9hZFBob3Rvcyh7XG4gICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKCdPb3BzJyk7XG4gICAgfSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZW5kZXIodGhpcyk7XG4gICAgfVxuICB9KTtcbn07XG5cbnJlbmRlciA9IGZ1bmN0aW9uKHlhbGJ1bSkge1xuICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZvdGt5JykuaW5uZXJIVE1MID0gdCh5YWxidW0ueW1ncyk7XG59O1xuXG50ID0gd2l0aE91dC4kY29tcGlsZShmdW5jdGlvbihsaXN0LCBzaXplKSB7XG4gIHZhciB5LCB5eiwgX2ksIF9sZW47XG4gIGlmIChzaXplID09IG51bGwpIHtcbiAgICBzaXplID0gJ1MnO1xuICB9XG4gIGZvciAoX2kgPSAwLCBfbGVuID0gbGlzdC5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgIHkgPSBsaXN0W19pXTtcbiAgICB5eiA9IHkuZGVmLmltZ1tzaXplXTtcbiAgICBkaXYoe1xuICAgICAgXCJjbGFzc1wiOiAndGh1bWJuYWlsJ1xuICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGEoe1xuICAgICAgICBzdHlsZTogXCJ3aWR0aDogXCIgKyB5ei53aWR0aCArIFwicHg7XCIsXG4gICAgICAgIGhyZWY6IFwiI1wiICsgKHkuZnVsbFBhdGgoKSksXG4gICAgICAgIHRpdGxlOiB5LmRlZi50aXRsZSB8fCBudWxsXG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgaW1nKHtcbiAgICAgICAgICBzcmM6IHl6LmhyZWZcbiAgICAgICAgfSk7XG4gICAgICAgIGRpdihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gYih5LmRlZi50aXRsZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGl2KHtcbiAgICAgICAgICB0aXRsZTogeS5kZWYuc3VtbWFyeSB8fCBudWxsXG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzbWFsbCh5LmRlZi5zdW1tYXJ5KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufSk7XG4iLCJ2YXIgWWFsYnVtLCBZbWcsIGpzb25wO1xuXG5ZbWcgPSByZXF1aXJlKDEpO1xuXG5qc29ucCA9IHJlcXVpcmUoMik7XG5cbllhbGJ1bSA9IGZ1bmN0aW9uKHl1c2VyLCBkZWYpIHtcbiAgdGhpcy5kZWYgPSBkZWY7XG4gIHRoaXMuaWQgPSBkZWYuaWQuc3BsaXQoJzonKS5yZXZlcnNlKClbMF07XG4gIHJldHVybiB0aGlzLnBhdGggPSB5dXNlci5pZDtcbn07XG5cbllhbGJ1bS5wcm90b3R5cGUgPSB7XG4gIGxvYWRQaG90b3M6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBpZiAoIXRoaXMudmlzaWJsZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiBqc29ucCh7XG4gICAgICB1cmw6IHRoaXMuZGVmLmxpbmtzLnBob3RvcyxcbiAgICAgIHN1Y2Nlc3M6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciB5LCBfcmVmO1xuICAgICAgICAgIF90aGlzLnltZ3MgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgICAgICAgX3JlZiA9ICh0aGlzLnBob3RvcyA9IGRhdGEpLmVudHJpZXM7XG4gICAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICAgIHkgPSBfcmVmW19pXTtcbiAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChuZXcgWW1nKHRoaXMsIHkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgICB9KS5jYWxsKF90aGlzKTtcbiAgICAgICAgICByZXR1cm4gKF9yZWYgPSBvcHRpb25zLnN1Y2Nlc3MpICE9IG51bGwgPyBfcmVmLmNhbGwoX3RoaXMpIDogdm9pZCAwO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyksXG4gICAgICBlcnJvcjogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgICByZXR1cm4gKF9yZWYgPSBvcHRpb25zLmVycm9yKSAhPSBudWxsID8gX3JlZi5jYWxsKF90aGlzKSA6IHZvaWQgMDtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpXG4gICAgfSk7XG4gIH0sXG4gIGZ1bGxQYXRoOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJcIiArIHRoaXMucGF0aCArIFwiL1wiICsgdGhpcy5pZDtcbiAgfSxcbiAgdmlzaWJsZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVmLmltZyAhPSBudWxsO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFlhbGJ1bTtcbiIsInZhciBZbWc7XG5cblltZyA9IGZ1bmN0aW9uKHlhbGJ1bSwgZGVmKSB7XG4gIHRoaXMuZGVmID0gZGVmO1xuICB0aGlzLmlkID0gZGVmLmlkLnNwbGl0KCc6JykucmV2ZXJzZSgpWzBdO1xuICByZXR1cm4gdGhpcy5wYXRoID0geWFsYnVtLmZ1bGxQYXRoKCk7XG59O1xuXG5ZbWcucHJvdG90eXBlID0ge1xuICBmdWxsUGF0aDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiXCIgKyB0aGlzLnBhdGggKyBcIi9cIiArIHRoaXMuaWQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gWW1nO1xuIiwidmFyIFlhbGJ1bSwgWXVzZXIsIGpzb25wO1xuXG5ZYWxidW0gPSByZXF1aXJlKDIpO1xuXG5qc29ucCA9IHJlcXVpcmUoMSk7XG5cbll1c2VyID0gZnVuY3Rpb24obmFtZSwgb3B0aW9ucykge1xuICB2YXIgZmluZElkLCBtYWtlWWFsYnVtcztcbiAgdGhpcy5uYW1lID0gbmFtZTtcbiAganNvbnAoe1xuICAgIHVybDogXCJodHRwOi8vYXBpLWZvdGtpLnlhbmRleC5ydS9hcGkvdXNlcnMvXCIgKyAoZXNjYXBlKG5hbWUpKSArIFwiLz9mb3JtYXQ9anNvblwiLFxuICAgIGVycm9yOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF9yZWY7XG4gICAgICAgIHJldHVybiAoX3JlZiA9IG9wdGlvbnMuZXJyb3IpICE9IG51bGwgPyBfcmVmLmNhbGwoX3RoaXMpIDogdm9pZCAwO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSxcbiAgICBzdWNjZXNzOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIF90aGlzLnNlcnZpY2UgPSBkYXRhO1xuICAgICAgICByZXR1cm4ganNvbnAoe1xuICAgICAgICAgIHVybDogZGF0YS5jb2xsZWN0aW9uc1snYWxidW0tbGlzdCddLmhyZWYgKyAnP2Zvcm1hdD1qc29uJyxcbiAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgICAgIHJldHVybiAoX3JlZiA9IG9wdGlvbnMuZXJyb3IpICE9IG51bGwgPyBfcmVmLmNhbGwoX3RoaXMpIDogdm9pZCAwO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdmFyIF9yZWY7XG4gICAgICAgICAgICBfdGhpcy5hbGJ1bXMgPSBkYXRhO1xuICAgICAgICAgICAgZmluZElkKCk7XG4gICAgICAgICAgICBfdGhpcy55YWxidW1zID0gbWFrZVlhbGJ1bXMoKTtcbiAgICAgICAgICAgIHJldHVybiAoX3JlZiA9IG9wdGlvbnMuc3VjY2VzcykgIT0gbnVsbCA/IF9yZWYuY2FsbChfdGhpcykgOiB2b2lkIDA7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcylcbiAgfSk7XG4gIGZpbmRJZCA9IChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhLCBfaSwgX2xlbiwgX3JlZjtcbiAgICAgIF9yZWYgPSBfdGhpcy5hbGJ1bXMuYXV0aG9ycztcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBhID0gX3JlZltfaV07XG4gICAgICAgIGlmIChhLm5hbWUgPT09IF90aGlzLm5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuaWQgPSBhLnVpZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0pKHRoaXMpO1xuICByZXR1cm4gbWFrZVlhbGJ1bXMgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYSwgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgX3JlZiA9IF90aGlzLmFsYnVtcy5lbnRyaWVzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBhID0gX3JlZltfaV07XG4gICAgICAgIF9yZXN1bHRzLnB1c2gobmV3IFlhbGJ1bShfdGhpcywgYSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG4gIH0pKHRoaXMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBZdXNlcjtcbiJdfQ==
