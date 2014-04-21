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
var jsonp, merge, random;

merge = require(1);

jsonp = function(options) {
  var Clear, Error, callback, cbname, js, timeout, url, _ref;
  _ref = merge(jsonp.defaults, options), url = _ref.url, callback = _ref.callback, timeout = _ref.timeout;
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

jsonp.defaults = {
  callback: 'callback',
  timeout: 3000
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

},{"1":5}],4:[function(require,module,exports){
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

},{"1":8,"2":2,"3":1}],5:[function(require,module,exports){
var merge;

merge = function() {
  var k, r, v, x, _i, _len;
  r = {};
  for (_i = 0, _len = arguments.length; _i < _len; _i++) {
    x = arguments[_i];
    for (k in x) {
      v = x[k];
      r[k] = v;
    }
  }
  return r;
};

module.exports = merge;

},{}],6:[function(require,module,exports){
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

},{"1":7,"2":3}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
var Yalbum, Yuser, jsonp;

Yalbum = require(1);

jsonp = require(2);

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

},{"1":6,"2":3}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVGVtcFxcZ2l0XFxmb3RreVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVGVtcC9naXQvZm90a3kvbm9kZV9tb2R1bGVzL3dpdGhvdXQvd2l0aG91dC5qcyIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy9oaXN0b3J5LmNvZmZlZSIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy9qc29ucC5jb2ZmZWUiLCJDOi9UZW1wL2dpdC9mb3RreS9zcmMvbWFpbi5jb2ZmZWUiLCJDOi9UZW1wL2dpdC9mb3RreS9zcmMvbWVyZ2UuY29mZmVlIiwiQzovVGVtcC9naXQvZm90a3kvc3JjL3lhbGJ1bS5jb2ZmZWUiLCJDOi9UZW1wL2dpdC9mb3RreS9zcmMveW1nLmNvZmZlZSIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy95dXNlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvL1xyXG4vLyB3aXRob3V0LmpzIC0gQ29mZmVTY3JpcHQgdGVtcGxhdGUgZW5naW5lIHdpdGggbGV4aWNhbCBzY29waW5nXHJcbi8vXHJcblxyXG4oZnVuY3Rpb24oKVxyXG57XHJcbiAgdmFyXHJcbiAgICBuVGFncz0nYSBhYmJyIGFjcm9ueW0gYWRkcmVzcyBhcHBsZXQgYXJ0aWNsZSBhc2lkZSBhdWRpbyBiIGJkbyBiaWcgYmxvY2txdW90ZSBib2R5IGJ1dHRvbiBcXFxyXG5jYW52YXMgY2FwdGlvbiBjZW50ZXIgY2l0ZSBjb2RlIGNvbGdyb3VwIGNvbW1hbmQgZGF0YWxpc3QgZGQgZGVsIGRldGFpbHMgZGZuIGRpciBkaXYgZGwgZHQgXFxcclxuZW0gZW1iZWQgZmllbGRzZXQgZmlnY2FwdGlvbiBmaWd1cmUgZm9udCBmb290ZXIgZm9ybSBmcmFtZXNldCBoMSBoMiBoMyBoNCBoNSBoNiBoZWFkIGhlYWRlciBoZ3JvdXAgaHRtbCBcXFxyXG5pIGlmcmFtZSBpbnMga2V5Z2VuIGtiZCBsYWJlbCBsZWdlbmQgbGkgbWFwIG1hcmsgbWVudSBtZXRlciBuYXYgbm9mcmFtZXMgbm9zY3JpcHQgb2JqZWN0IFxcXHJcbm9sIG9wdGdyb3VwIG9wdGlvbiBvdXRwdXQgcCBwcmUgcHJvZ3Jlc3MgcSBycCBydCBydWJ5IFxcXHJcbnMgc2FtcCBzY3JpcHQgc2VjdGlvbiBzZWxlY3Qgc21hbGwgc291cmNlIHNwYW4gc3RyaWtlIHN0cm9uZyBzdHlsZSBzdWIgc3VtbWFyeSBzdXAgXFxcclxudGFibGUgdGJvZHkgdGQgdGV4dGFyZWEgdGZvb3QgdGggdGhlYWQgdGltZSB0aXRsZSB0ciB0dCB1IHVsIHZpZGVvIHdiciB4bXAnLnNwbGl0KCcgJyksXHJcbiAgICBlVGFncz0nYXJlYSBiYXNlIGJhc2Vmb250IGJyIGNvbCBmcmFtZSBociBpbWcgaW5wdXQgbGluayBtZXRhIHBhcmFtJy5zcGxpdCgnICcpLFxyXG4gICAgaHRtbEVudGl0aWVzPXsnJic6ICcmYW1wOycsICc8JzogJyZsdDsnLCAnPic6ICcmZ3Q7JywgJ1wiJzogJyZxdW90Oyd9LFxyXG4gICAgc2xpY2U9W10uc2xpY2UsXHJcbiAgICBzY29wZT17fSxcclxuICAgIGh0bWw9JycsXHJcbiAgICBfdGhpc1xyXG5cclxuICBmdW5jdGlvbiBoKHMpXHJcbiAge1xyXG4gICAgcmV0dXJuIFN0cmluZyhzKS5yZXBsYWNlKC9bJjw+XCJdL2csIGZ1bmN0aW9uKGUpe3JldHVybiBodG1sRW50aXRpZXNbZV19KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2hpbGRyZW4oYSlcclxuICB7XHJcbiAgICB2YXIgaSwgZVxyXG4gICAgZm9yKGk9MDsgaTxhLmxlbmd0aDsgaSsrKVxyXG4gICAge1xyXG4gICAgICBpZihudWxsPT0oZT1hW2ldKSkgY29udGludWU7XHJcbiAgICAgIGlmKCdmdW5jdGlvbic9PXR5cGVvZiBlKVxyXG4gICAgICAgIGUuY2FsbChfdGhpcylcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGh0bWwrPWgoZSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHByaW50KGEpXHJcbiAge1xyXG4gICAgdmFyIGksIGVcclxuICAgIGZvcihpPTA7IGk8YS5sZW5ndGg7IGkrKykgaWYobnVsbCE9KGU9YVtpXSkpIGh0bWwrPWgoZSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJhdyhhKVxyXG4gIHtcclxuICAgIHZhciBpLCBlXHJcbiAgICBmb3IoaT0wOyBpPGEubGVuZ3RoOyBpKyspIGlmKG51bGwhPShlPWFbaV0pKSBodG1sKz1lXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYWtlVGFnKG5hbWUsIGVtcHR5KVxyXG4gIHtcclxuICAgIHJldHVybiBmdW5jdGlvbigpe3RhZyhhcmd1bWVudHMpfVxyXG4gICAgZnVuY3Rpb24gYXR0cihrLCB2KVxyXG4gICAge1xyXG4gICAgICBpZihudWxsPT12IHx8IGZhbHNlPT09dikgcmV0dXJuXHJcbiAgICAgIGh0bWwrPScgJytoKGspXHJcbiAgICAgIGlmKHRydWUhPT12KSBodG1sKz0nPVwiJytoKHYpKydcIidcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIG5lc3QocHJlZml4LCBvYmopXHJcbiAgICB7XHJcbiAgICAgIGZvcih2YXIgayBpbiBvYmopXHJcbiAgICAgICAgaWYoJ29iamVjdCc9PXR5cGVvZiBvYmpba10pXHJcbiAgICAgICAgICBuZXN0KHByZWZpeCtrKyctJywgb2JqW2tdKVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGF0dHIocHJlZml4K2ssIG9ialtrXSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHRhZyhhKVxyXG4gICAge1xyXG4gICAgICBodG1sKz0nPCcrbmFtZVxyXG4gICAgICB2YXIgYXQ9YVswXVxyXG4gICAgICBpZignb2JqZWN0Jz09dHlwZW9mIGF0KVxyXG4gICAgICB7XHJcbiAgICAgICBmb3IodmFyIGsgaW4gYXQpXHJcbiAgICAgICAgIGlmKCdkYXRhJz09ayAmJiAnb2JqZWN0Jz09dHlwZW9mIGF0W2tdKVxyXG4gICAgICAgICAgIG5lc3QoJ2RhdGEtJywgYXRba10pXHJcbiAgICAgICAgIGVsc2VcclxuICAgICAgICAgICBhdHRyKGssIGF0W2tdKVxyXG4gICAgICAgYT1zbGljZS5jYWxsKGEsIDEpXHJcbiAgICAgIH1cclxuICAgICAgaHRtbCs9Jz4nXHJcbiAgICAgIGlmKGVtcHR5ICYmIGEubGVuZ3RoKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCI8XCIrbmFtZStcIj4gbXVzdCBoYXZlIG5vIGNvbnRlbnQhXCIpXHJcbiAgICAgIGlmKGVtcHR5KSByZXR1cm5cclxuICAgICAgY2hpbGRyZW4oYSlcclxuICAgICAgaHRtbCs9XCI8L1wiK25hbWUrXCI+XCJcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG1ha2VDb21tZW50KClcclxuICB7XHJcbiAgICB2YXIgbGV2ZWw9MDtcclxuICAgIHJldHVybiBmdW5jdGlvbigpeyBjb21tZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfVxyXG4gICAgZnVuY3Rpb24gY29tbWVudCgpXHJcbiAgICB7XHJcbiAgICAgIGh0bWwrPSBsZXZlbCsrPyAnPGNvbW1lbnQgbGV2ZWw9XCInK2xldmVsKydcIj4nIDogXCI8IS0tIFwiXHJcbiAgICAgIGNoaWxkcmVuKGFyZ3VtZW50cylcclxuICAgICAgaHRtbCs9IC0tbGV2ZWw/ICc8L2NvbW1lbnQ+JzogJyAtLT4nXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb2ZmZWVTY3JpcHQoKVxyXG4gIHtcclxuICAgIGlmKDEhPWFyZ3VtZW50cy5sZW5ndGggfHwnZnVuY3Rpb24nIT10eXBlb2YgYXJndW1lbnRzWzBdKVxyXG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ1VzYWdlOiBjb2ZmZWVzY3JpcHQgLT4gY29kZScpXHJcbiAgICBodG1sKz0nPHNjcmlwdD48IS0tXFxuKCcrYXJndW1lbnRzWzBdLnRvU3RyaW5nKCkrJykoKVxcbi8vLS0+XFxuPC9zY3JpcHQ+JztcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkaG9jVGFnKClcclxuICB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24obmFtZSwgZW1wdHkpeyByZXR1cm4gdGFnKG5hbWUsIGVtcHR5KSB9XHJcbiAgICBmdW5jdGlvbiBpc0VtcHR5KG5hbWUpXHJcbiAgICB7XHJcbiAgICAgIGZvcih2YXIgaSBpbiBlVGFncykgaWYobmFtZT09ZVRhZ3NbaV0pIHJldHVybiB0cnVlXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0YWcobmFtZSwgZW1wdHkpXHJcbiAgICB7XHJcbiAgICAgIHJldHVybiBtYWtlVGFnKG5hbWUsIG51bGw9PWVtcHR5PyBpc0VtcHR5KFN0cmluZyhuYW1lKS50b0xvd2VyQ2FzZSgpKSA6IGVtcHR5KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbm9UYWcoYXR0cnMpXHJcbiAge1xyXG4gICAgY2hpbGRyZW4oJ29iamVjdCc9PXR5cGVvZiBhdHRycyA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IGFyZ3VtZW50cylcclxuICB9XHJcblxyXG4gIHNjb3BlLnByaW50PXNjb3BlLnRleHQ9ZnVuY3Rpb24oKXtwcmludChhcmd1bWVudHMpfVxyXG4gIHNjb3BlLnJhdz1mdW5jdGlvbigpe3Jhdyhhcmd1bWVudHMpfVxyXG4gIHNjb3BlLnRhZz1hZGhvY1RhZygpXHJcbiAgc2NvcGUubm90YWc9ZnVuY3Rpb24oKXtub1RhZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpfVxyXG4gIHNjb3BlLmNvbW1lbnQ9bWFrZUNvbW1lbnQoKVxyXG4gIHNjb3BlLmJsYWNraG9sZT1mdW5jdGlvbigpe31cclxuICBzY29wZS5jb2ZmZWVzY3JpcHQ9ZnVuY3Rpb24oKXsgY29mZmVlU2NyaXB0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfVxyXG5cclxuICBmb3IodmFyIGkgaW4gblRhZ3MpIHNjb3BlW25UYWdzW2ldXT1tYWtlVGFnKG5UYWdzW2ldKVxyXG4gIHNjb3BlLiR2YXI9bWFrZVRhZygndmFyJylcclxuICBmb3IodmFyIGkgaW4gZVRhZ3MpIHNjb3BlW2VUYWdzW2ldXT1tYWtlVGFnKGVUYWdzW2ldLCB0cnVlKVxyXG5cclxuICBmdW5jdGlvbiBtYWtlVmFycygpXHJcbiAge1xyXG4gICAgdmFyIHY9W107XHJcbiAgICBmb3IodmFyIHRhZyBpbiBzY29wZSkgdi5wdXNoKHRhZysnPXRoaXMuJyt0YWcpXHJcbiAgICByZXR1cm4gJ3ZhciAnK3Yuam9pbignLCcpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZXRDb250ZXh0KGZuKXtcclxuICAgIHJldHVybiAobmV3IEZ1bmN0aW9uKG1ha2VWYXJzKCkrJ1xcbnJldHVybiAnK2ZuLnRvU3RyaW5nKCkpKS5jYWxsKHNjb3BlKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyYWJsZShmbilcclxuICB7XHJcbiAgICBpZignZnVuY3Rpb24nIT10eXBlb2YgZm4pIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYWxsOiB3aXRoT3V0LmNvbXBpbGUoZnVuY3Rpb24pXCIpO1xyXG4gICAgdmFyIHBlbmRpbmc9dHJ1ZVxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKClcclxuICAgIHtcclxuICAgICAgaWYocGVuZGluZylcclxuICAgICAge1xyXG4gICAgICAgIGZuPXNldENvbnRleHQoZm4pXHJcbiAgICAgICAgcGVuZGluZz1mYWxzZVxyXG4gICAgICB9XHJcbiAgICAgIHRyeVxyXG4gICAgICB7XHJcbiAgICAgICAgdmFyIHRoYXQ9X3RoaXMsIHg9aHRtbFxyXG4gICAgICAgIF90aGlzPXRoaXNcclxuICAgICAgICBodG1sPScnXHJcbiAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxyXG4gICAgICAgIHJldHVybiBodG1sXHJcbiAgICAgIH1cclxuICAgICAgZmluYWxseVxyXG4gICAgICB7XHJcbiAgICAgICAgX3RoaXM9dGhhdFxyXG4gICAgICAgIGh0bWw9eFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb21waWxlKGZuKVxyXG4gIHtcclxuICAgIHZhciB3aXRoT3V0PXJlbmRlcmFibGUoZm4pO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIHdpdGhPdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKX1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uICRjb21waWxlKGZuKVxyXG4gIHtcclxuICAgIHZhciB3aXRoT3V0PXJlbmRlcmFibGUoZm4pO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIHdpdGhPdXQuYXBwbHkoYXJndW1lbnRzWzBdLCBhcmd1bWVudHMpfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmxhdHRlbihhcnJheSlcclxuICB7XHJcbiAgICB2YXIgdiwgcj1bXVxyXG4gICAgZm9yKHZhciBpIGluIGFycmF5KVxyXG4gICAgICBpZignb2JqZWN0Jz09dHlwZW9mKHY9YXJyYXlbaV0pKVxyXG4gICAgICAgIHIucHVzaC5hcHBseShyLCBmbGF0dGVuKHYpKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgci5wdXNoKHYpXHJcbiAgICByZXR1cm4gclxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmV0Y2hKU1RzKHBhdGhzKVxyXG4gIHtcclxuICAgIHZhciB2XHJcbiAgICBmb3IodmFyIGkgaW4gcGF0aHMpXHJcbiAgICB7XHJcbiAgICAgIGlmKCdmdW5jdGlvbichPXR5cGVvZih2PXBhdGhzW2ldKSAmJlxyXG4gICAgICAgICAnZnVuY3Rpb24nIT10eXBlb2Yodj1KU1Rbdl0pKVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkpTVFsnXCIrcGF0aHNbaV0rXCInXSBub3QgZm91bmQgb3IgaW5jb3JyZWN0IVwiKVxyXG4gICAgICBwYXRoc1tpXT1yZW5kZXJhYmxlKHYpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGF0aHNcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIEpTVHMocGF0aClcclxuICB7XHJcbiAgICB2YXIgYm91bmQsIFRzPWZsYXR0ZW4oc2xpY2UuY2FsbChhcmd1bWVudHMpKVxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIEpTVHMuYXBwbHkoYXJndW1lbnRzWzBdLCBhcmd1bWVudHMpfVxyXG4gICAgZnVuY3Rpb24gSlNUcygpXHJcbiAgICB7XHJcbiAgICAgIHZhciBTPScnXHJcbiAgICAgIGlmKCFib3VuZClcclxuICAgICAge1xyXG4gICAgICAgIFRzPWZldGNoSlNUcyhUcylcclxuICAgICAgICBib3VuZD10cnVlXHJcbiAgICAgIH1cclxuICAgICAgZm9yKHZhciBpIGluIFRzKSBTKz1Uc1tpXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpXHJcbiAgICAgIHJldHVybiBTXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB2YXIgaW50ZXJmYWNlPXtcclxuICAgIGNvbXBpbGU6IGNvbXBpbGUsXHJcbiAgICByZW5kZXJhYmxlOiBjb21waWxlLFxyXG4gICAgJGNvbXBpbGU6ICRjb21waWxlLFxyXG4gICAgSlNUczogSlNUc1xyXG4gIH1cclxuICBpZigndW5kZWZpbmVkJyE9dHlwZW9mIG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cylcclxuICAgIG1vZHVsZS5leHBvcnRzPWludGVyZmFjZVxyXG4gIGVsc2UgaWYoJ2Z1bmN0aW9uJz09dHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kKVxyXG4gICAgZGVmaW5lKGludGVyZmFjZSlcclxuICBlbHNlXHJcbiAgICB0aGlzLndpdGhPdXQ9aW50ZXJmYWNlXHJcbn0pKClcclxuXHJcbi8vLS1bRU9GXS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4iLCJ2YXIgY2hlY2tIYXNoLCBwcmV2LCBzdGFydEhpc3RvcnksIHQsIHdpdGhPdXQ7XG5cbndpdGhPdXQgPSByZXF1aXJlKDEpO1xuXG5wcmV2ID0gbnVsbDtcblxuY2hlY2tIYXNoID0gZnVuY3Rpb24oKSB7XG4gIHZhciBoYXNoO1xuICBoYXNoID0gLyMoLiopfCQvLmV4ZWMobG9jYXRpb24uaHJlZilbMV0gfHwgJyc7XG4gIGlmIChwcmV2ID09PSBoYXNoKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHByZXYgPSBoYXNoO1xuICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hhc2gnKS5pbm5lckhUTUwgPSB0KGhhc2gpO1xufTtcblxudCA9IHdpdGhPdXQuJGNvbXBpbGUoZnVuY3Rpb24oKSB7XG4gIGIoJ0hhc2g6ICcpO1xuICByZXR1cm4gdGV4dCh0aGlzKTtcbn0pO1xuXG5zdGFydEhpc3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgY2hlY2tIYXNoKCk7XG4gIGlmICgnb25oYXNoY2hhbmdlJyBpbiB3aW5kb3cpIHtcbiAgICByZXR1cm4gd2luZG93Lm9uaGFzaGNoYW5nZSA9IGNoZWNrSGFzaDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gd2luZG93LnNldEludGVydmFsKGNoZWNrSGFzaCwgNTApO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXJ0SGlzdG9yeTtcbiIsInZhciBqc29ucCwgbWVyZ2UsIHJhbmRvbTtcblxubWVyZ2UgPSByZXF1aXJlKDEpO1xuXG5qc29ucCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIENsZWFyLCBFcnJvciwgY2FsbGJhY2ssIGNibmFtZSwganMsIHRpbWVvdXQsIHVybCwgX3JlZjtcbiAgX3JlZiA9IG1lcmdlKGpzb25wLmRlZmF1bHRzLCBvcHRpb25zKSwgdXJsID0gX3JlZi51cmwsIGNhbGxiYWNrID0gX3JlZi5jYWxsYmFjaywgdGltZW91dCA9IF9yZWYudGltZW91dDtcbiAgd2hpbGUgKHdpbmRvd1tjYm5hbWUgPSBcIl9cIiArIChyYW5kb20oMTUpKV0pIHt9XG4gIHdpbmRvd1tjYm5hbWVdID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChDbGVhcigpKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9wdGlvbnMuc3VjY2VzcyA9PT0gXCJmdW5jdGlvblwiID8gb3B0aW9ucy5zdWNjZXNzKGRhdGEpIDogdm9pZCAwO1xuICAgIH1cbiAgfTtcbiAgRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoQ2xlYXIoKSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvcHRpb25zLmVycm9yID09PSBcImZ1bmN0aW9uXCIgPyBvcHRpb25zLmVycm9yKCkgOiB2b2lkIDA7XG4gICAgfVxuICB9O1xuICBqcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBqcy5hc3luYyA9IHRydWU7XG4gIGpzLm9uZXJyb3IgPSBFcnJvcjtcbiAganMuc3JjID0gXCJcIiArIHVybCArICh1cmwuaW5kZXhPZignPycpID49IDAgPyAnJicgOiAnPycpICsgY2FsbGJhY2sgKyBcIj1cIiArIGNibmFtZTtcbiAgKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0gfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXSkuYXBwZW5kQ2hpbGQoanMpO1xuICBzZXRUaW1lb3V0KEVycm9yLCB0aW1lb3V0KTtcbiAgQ2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWpzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRlbGV0ZSB3aW5kb3dbY2JuYW1lXTtcbiAgICBqcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGpzKTtcbiAgICBqcyA9IG51bGw7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG59O1xuXG5qc29ucC5kZWZhdWx0cyA9IHtcbiAgY2FsbGJhY2s6ICdjYWxsYmFjaycsXG4gIHRpbWVvdXQ6IDMwMDBcbn07XG5cbnJhbmRvbSA9IGZ1bmN0aW9uKHEpIHtcbiAgdmFyIG4sIHM7XG4gIGlmIChxID09IG51bGwpIHtcbiAgICBxID0gMTtcbiAgfVxuICBzID0gJyc7XG4gIHdoaWxlIChzLmxlbmd0aCA8IHEpIHtcbiAgICBuID0gTWF0aC5mbG9vcig2MiAqIE1hdGgucmFuZG9tKCkpO1xuICAgIHMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShuICUgMjYgKyAnQWEwJy5jaGFyQ29kZUF0KG4gLyAyNikpO1xuICB9XG4gIHJldHVybiBzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBqc29ucDtcbiIsInZhciBZdXNlciwgaGlzdG9yeSwgbG9hZCwgcmVuZGVyLCB0LCB1LCB3aXRoT3V0O1xuXG53aXRoT3V0ID0gcmVxdWlyZSgzKTtcblxuWXVzZXIgPSByZXF1aXJlKDEpO1xuXG5oaXN0b3J5ID0gcmVxdWlyZSgyKTtcblxuc2V0VGltZW91dChoaXN0b3J5KTtcblxudSA9IG5ldyBZdXNlcignc3RhbmlzbGF2LXVrb2xvdicsIHtcbiAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGEsIF9pLCBfbGVuLCBfcmVmO1xuICAgIF9yZWYgPSB0aGlzLnlhbGJ1bXM7XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBhID0gX3JlZltfaV07XG4gICAgICBpZiAoYS5kZWYuaW1nKSB7XG4gICAgICAgIGxvYWQoYSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKCdObyBhbGJ1bXMgZm91bmQnKTtcbiAgfVxufSk7XG5cbmxvYWQgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBhLmxvYWRQaG90b3Moe1xuICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZygnT29wcycpO1xuICAgIH0sXG4gICAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVuZGVyKHRoaXMpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5yZW5kZXIgPSBmdW5jdGlvbih5YWxidW0pIHtcbiAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3RreScpLmlubmVySFRNTCA9IHQoeWFsYnVtLnltZ3MpO1xufTtcblxudCA9IHdpdGhPdXQuJGNvbXBpbGUoZnVuY3Rpb24obGlzdCwgc2l6ZSkge1xuICB2YXIgeSwgeXosIF9pLCBfbGVuO1xuICBpZiAoc2l6ZSA9PSBudWxsKSB7XG4gICAgc2l6ZSA9ICdTJztcbiAgfVxuICBmb3IgKF9pID0gMCwgX2xlbiA9IGxpc3QubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICB5ID0gbGlzdFtfaV07XG4gICAgeXogPSB5LmRlZi5pbWdbc2l6ZV07XG4gICAgZGl2KHtcbiAgICAgIFwiY2xhc3NcIjogJ3RodW1ibmFpbCdcbiAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBhKHtcbiAgICAgICAgc3R5bGU6IFwid2lkdGg6IFwiICsgeXoud2lkdGggKyBcInB4O1wiLFxuICAgICAgICBocmVmOiBcIiNcIiArICh5LmZ1bGxQYXRoKCkpLFxuICAgICAgICB0aXRsZTogeS5kZWYudGl0bGUgfHwgbnVsbFxuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGltZyh7XG4gICAgICAgICAgc3JjOiB5ei5ocmVmXG4gICAgICAgIH0pO1xuICAgICAgICBkaXYoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGIoeS5kZWYudGl0bGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRpdih7XG4gICAgICAgICAgdGl0bGU6IHkuZGVmLnN1bW1hcnkgfHwgbnVsbFxuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gc21hbGwoeS5kZWYuc3VtbWFyeSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn0pO1xuIiwidmFyIG1lcmdlO1xuXG5tZXJnZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaywgciwgdiwgeCwgX2ksIF9sZW47XG4gIHIgPSB7fTtcbiAgZm9yIChfaSA9IDAsIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICB4ID0gYXJndW1lbnRzW19pXTtcbiAgICBmb3IgKGsgaW4geCkge1xuICAgICAgdiA9IHhba107XG4gICAgICByW2tdID0gdjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1lcmdlO1xuIiwidmFyIFlhbGJ1bSwgWW1nLCBqc29ucDtcblxuWW1nID0gcmVxdWlyZSgxKTtcblxuanNvbnAgPSByZXF1aXJlKDIpO1xuXG5ZYWxidW0gPSBmdW5jdGlvbih5dXNlciwgZGVmKSB7XG4gIHRoaXMuZGVmID0gZGVmO1xuICB0aGlzLmlkID0gZGVmLmlkLnNwbGl0KCc6JykucmV2ZXJzZSgpWzBdO1xuICByZXR1cm4gdGhpcy5wYXRoID0geXVzZXIuaWQ7XG59O1xuXG5ZYWxidW0ucHJvdG90eXBlID0ge1xuICBsb2FkUGhvdG9zOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCF0aGlzLnZpc2libGUoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4ganNvbnAoe1xuICAgICAgdXJsOiB0aGlzLmRlZi5saW5rcy5waG90b3MsXG4gICAgICBzdWNjZXNzOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgeSwgX3JlZjtcbiAgICAgICAgICBfdGhpcy55bWdzID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgICAgICAgIF9yZWYgPSAodGhpcy5waG90b3MgPSBkYXRhKS5lbnRyaWVzO1xuICAgICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgICB5ID0gX3JlZltfaV07XG4gICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2gobmV3IFltZyh0aGlzLCB5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgICAgfSkuY2FsbChfdGhpcyk7XG4gICAgICAgICAgcmV0dXJuIChfcmVmID0gb3B0aW9ucy5zdWNjZXNzKSAhPSBudWxsID8gX3JlZi5jYWxsKF90aGlzKSA6IHZvaWQgMDtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpLFxuICAgICAgZXJyb3I6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIF9yZWY7XG4gICAgICAgICAgcmV0dXJuIChfcmVmID0gb3B0aW9ucy5lcnJvcikgIT0gbnVsbCA/IF9yZWYuY2FsbChfdGhpcykgOiB2b2lkIDA7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKVxuICAgIH0pO1xuICB9LFxuICBmdWxsUGF0aDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiXCIgKyB0aGlzLnBhdGggKyBcIi9cIiArIHRoaXMuaWQ7XG4gIH0sXG4gIHZpc2libGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRlZi5pbWcgIT0gbnVsbDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBZYWxidW07XG4iLCJ2YXIgWW1nO1xuXG5ZbWcgPSBmdW5jdGlvbih5YWxidW0sIGRlZikge1xuICB0aGlzLmRlZiA9IGRlZjtcbiAgdGhpcy5pZCA9IGRlZi5pZC5zcGxpdCgnOicpLnJldmVyc2UoKVswXTtcbiAgcmV0dXJuIHRoaXMucGF0aCA9IHlhbGJ1bS5mdWxsUGF0aCgpO1xufTtcblxuWW1nLnByb3RvdHlwZSA9IHtcbiAgZnVsbFBhdGg6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIlwiICsgdGhpcy5wYXRoICsgXCIvXCIgKyB0aGlzLmlkO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFltZztcbiIsInZhciBZYWxidW0sIFl1c2VyLCBqc29ucDtcblxuWWFsYnVtID0gcmVxdWlyZSgxKTtcblxuanNvbnAgPSByZXF1aXJlKDIpO1xuXG5ZdXNlciA9IGZ1bmN0aW9uKG5hbWUsIG9wdGlvbnMpIHtcbiAgdmFyIGZpbmRJZCwgbWFrZVlhbGJ1bXM7XG4gIHRoaXMubmFtZSA9IG5hbWU7XG4gIGpzb25wKHtcbiAgICB1cmw6IFwiaHR0cDovL2FwaS1mb3RraS55YW5kZXgucnUvYXBpL3VzZXJzL1wiICsgKGVzY2FwZShuYW1lKSkgKyBcIi8/Zm9ybWF0PWpzb25cIixcbiAgICBlcnJvcjogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfcmVmO1xuICAgICAgICByZXR1cm4gKF9yZWYgPSBvcHRpb25zLmVycm9yKSAhPSBudWxsID8gX3JlZi5jYWxsKF90aGlzKSA6IHZvaWQgMDtcbiAgICAgIH07XG4gICAgfSkodGhpcyksXG4gICAgc3VjY2VzczogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBfdGhpcy5zZXJ2aWNlID0gZGF0YTtcbiAgICAgICAgcmV0dXJuIGpzb25wKHtcbiAgICAgICAgICB1cmw6IGRhdGEuY29sbGVjdGlvbnNbJ2FsYnVtLWxpc3QnXS5ocmVmICsgJz9mb3JtYXQ9anNvbicsXG4gICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIF9yZWY7XG4gICAgICAgICAgICByZXR1cm4gKF9yZWYgPSBvcHRpb25zLmVycm9yKSAhPSBudWxsID8gX3JlZi5jYWxsKF90aGlzKSA6IHZvaWQgMDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBfcmVmO1xuICAgICAgICAgICAgX3RoaXMuYWxidW1zID0gZGF0YTtcbiAgICAgICAgICAgIGZpbmRJZCgpO1xuICAgICAgICAgICAgX3RoaXMueWFsYnVtcyA9IG1ha2VZYWxidW1zKCk7XG4gICAgICAgICAgICByZXR1cm4gKF9yZWYgPSBvcHRpb25zLnN1Y2Nlc3MpICE9IG51bGwgPyBfcmVmLmNhbGwoX3RoaXMpIDogdm9pZCAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpXG4gIH0pO1xuICBmaW5kSWQgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYSwgX2ksIF9sZW4sIF9yZWY7XG4gICAgICBfcmVmID0gX3RoaXMuYWxidW1zLmF1dGhvcnM7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgYSA9IF9yZWZbX2ldO1xuICAgICAgICBpZiAoYS5uYW1lID09PSBfdGhpcy5uYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmlkID0gYS51aWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9KSh0aGlzKTtcbiAgcmV0dXJuIG1ha2VZYWxidW1zID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGEsIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZWYgPSBfdGhpcy5hbGJ1bXMuZW50cmllcztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgYSA9IF9yZWZbX2ldO1xuICAgICAgICBfcmVzdWx0cy5wdXNoKG5ldyBZYWxidW0oX3RoaXMsIGEpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuICB9KSh0aGlzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gWXVzZXI7XG4iXX0=
