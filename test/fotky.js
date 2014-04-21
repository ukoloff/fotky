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
var checkHash, prev, t, withOut;

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

module.exports = function() {
  checkHash();
  if ('onhashchange' in window) {
    return window.onhashchange = checkHash;
  } else {
    return window.setInterval(checkHash, 50);
  }
};

},{"1":1}],3:[function(require,module,exports){
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

},{"1":5,"2":3}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVGVtcFxcZ2l0XFxmb3RreVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVGVtcC9naXQvZm90a3kvbm9kZV9tb2R1bGVzL3dpdGhvdXQvd2l0aG91dC5qcyIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy9oaXN0b3J5LmNvZmZlZSIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy9qc29ucC5jb2ZmZWUiLCJDOi9UZW1wL2dpdC9mb3RreS9zcmMvbWFpbi5jb2ZmZWUiLCJDOi9UZW1wL2dpdC9mb3RreS9zcmMveWFsYnVtLmNvZmZlZSIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy95bWcuY29mZmVlIiwiQzovVGVtcC9naXQvZm90a3kvc3JjL3l1c2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vXHJcbi8vIHdpdGhvdXQuanMgLSBDb2ZmZVNjcmlwdCB0ZW1wbGF0ZSBlbmdpbmUgd2l0aCBsZXhpY2FsIHNjb3BpbmdcclxuLy9cclxuXHJcbihmdW5jdGlvbigpXHJcbntcclxuICB2YXJcclxuICAgIG5UYWdzPSdhIGFiYnIgYWNyb255bSBhZGRyZXNzIGFwcGxldCBhcnRpY2xlIGFzaWRlIGF1ZGlvIGIgYmRvIGJpZyBibG9ja3F1b3RlIGJvZHkgYnV0dG9uIFxcXHJcbmNhbnZhcyBjYXB0aW9uIGNlbnRlciBjaXRlIGNvZGUgY29sZ3JvdXAgY29tbWFuZCBkYXRhbGlzdCBkZCBkZWwgZGV0YWlscyBkZm4gZGlyIGRpdiBkbCBkdCBcXFxyXG5lbSBlbWJlZCBmaWVsZHNldCBmaWdjYXB0aW9uIGZpZ3VyZSBmb250IGZvb3RlciBmb3JtIGZyYW1lc2V0IGgxIGgyIGgzIGg0IGg1IGg2IGhlYWQgaGVhZGVyIGhncm91cCBodG1sIFxcXHJcbmkgaWZyYW1lIGlucyBrZXlnZW4ga2JkIGxhYmVsIGxlZ2VuZCBsaSBtYXAgbWFyayBtZW51IG1ldGVyIG5hdiBub2ZyYW1lcyBub3NjcmlwdCBvYmplY3QgXFxcclxub2wgb3B0Z3JvdXAgb3B0aW9uIG91dHB1dCBwIHByZSBwcm9ncmVzcyBxIHJwIHJ0IHJ1YnkgXFxcclxucyBzYW1wIHNjcmlwdCBzZWN0aW9uIHNlbGVjdCBzbWFsbCBzb3VyY2Ugc3BhbiBzdHJpa2Ugc3Ryb25nIHN0eWxlIHN1YiBzdW1tYXJ5IHN1cCBcXFxyXG50YWJsZSB0Ym9keSB0ZCB0ZXh0YXJlYSB0Zm9vdCB0aCB0aGVhZCB0aW1lIHRpdGxlIHRyIHR0IHUgdWwgdmlkZW8gd2JyIHhtcCcuc3BsaXQoJyAnKSxcclxuICAgIGVUYWdzPSdhcmVhIGJhc2UgYmFzZWZvbnQgYnIgY29sIGZyYW1lIGhyIGltZyBpbnB1dCBsaW5rIG1ldGEgcGFyYW0nLnNwbGl0KCcgJyksXHJcbiAgICBodG1sRW50aXRpZXM9eycmJzogJyZhbXA7JywgJzwnOiAnJmx0OycsICc+JzogJyZndDsnLCAnXCInOiAnJnF1b3Q7J30sXHJcbiAgICBzbGljZT1bXS5zbGljZSxcclxuICAgIHNjb3BlPXt9LFxyXG4gICAgaHRtbD0nJyxcclxuICAgIF90aGlzXHJcblxyXG4gIGZ1bmN0aW9uIGgocylcclxuICB7XHJcbiAgICByZXR1cm4gU3RyaW5nKHMpLnJlcGxhY2UoL1smPD5cIl0vZywgZnVuY3Rpb24oZSl7cmV0dXJuIGh0bWxFbnRpdGllc1tlXX0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGlsZHJlbihhKVxyXG4gIHtcclxuICAgIHZhciBpLCBlXHJcbiAgICBmb3IoaT0wOyBpPGEubGVuZ3RoOyBpKyspXHJcbiAgICB7XHJcbiAgICAgIGlmKG51bGw9PShlPWFbaV0pKSBjb250aW51ZTtcclxuICAgICAgaWYoJ2Z1bmN0aW9uJz09dHlwZW9mIGUpXHJcbiAgICAgICAgZS5jYWxsKF90aGlzKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaHRtbCs9aChlKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcHJpbnQoYSlcclxuICB7XHJcbiAgICB2YXIgaSwgZVxyXG4gICAgZm9yKGk9MDsgaTxhLmxlbmd0aDsgaSsrKSBpZihudWxsIT0oZT1hW2ldKSkgaHRtbCs9aChlKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmF3KGEpXHJcbiAge1xyXG4gICAgdmFyIGksIGVcclxuICAgIGZvcihpPTA7IGk8YS5sZW5ndGg7IGkrKykgaWYobnVsbCE9KGU9YVtpXSkpIGh0bWwrPWVcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG1ha2VUYWcobmFtZSwgZW1wdHkpXHJcbiAge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7dGFnKGFyZ3VtZW50cyl9XHJcbiAgICBmdW5jdGlvbiBhdHRyKGssIHYpXHJcbiAgICB7XHJcbiAgICAgIGlmKG51bGw9PXYgfHwgZmFsc2U9PT12KSByZXR1cm5cclxuICAgICAgaHRtbCs9JyAnK2goaylcclxuICAgICAgaWYodHJ1ZSE9PXYpIGh0bWwrPSc9XCInK2godikrJ1wiJ1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbmVzdChwcmVmaXgsIG9iailcclxuICAgIHtcclxuICAgICAgZm9yKHZhciBrIGluIG9iailcclxuICAgICAgICBpZignb2JqZWN0Jz09dHlwZW9mIG9ialtrXSlcclxuICAgICAgICAgIG5lc3QocHJlZml4K2srJy0nLCBvYmpba10pXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgYXR0cihwcmVmaXgraywgb2JqW2tdKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gdGFnKGEpXHJcbiAgICB7XHJcbiAgICAgIGh0bWwrPSc8JytuYW1lXHJcbiAgICAgIHZhciBhdD1hWzBdXHJcbiAgICAgIGlmKCdvYmplY3QnPT10eXBlb2YgYXQpXHJcbiAgICAgIHtcclxuICAgICAgIGZvcih2YXIgayBpbiBhdClcclxuICAgICAgICAgaWYoJ2RhdGEnPT1rICYmICdvYmplY3QnPT10eXBlb2YgYXRba10pXHJcbiAgICAgICAgICAgbmVzdCgnZGF0YS0nLCBhdFtrXSlcclxuICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIGF0dHIoaywgYXRba10pXHJcbiAgICAgICBhPXNsaWNlLmNhbGwoYSwgMSlcclxuICAgICAgfVxyXG4gICAgICBodG1sKz0nPidcclxuICAgICAgaWYoZW1wdHkgJiYgYS5sZW5ndGgpIHRocm93IG5ldyBTeW50YXhFcnJvcihcIjxcIituYW1lK1wiPiBtdXN0IGhhdmUgbm8gY29udGVudCFcIilcclxuICAgICAgaWYoZW1wdHkpIHJldHVyblxyXG4gICAgICBjaGlsZHJlbihhKVxyXG4gICAgICBodG1sKz1cIjwvXCIrbmFtZStcIj5cIlxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWFrZUNvbW1lbnQoKVxyXG4gIHtcclxuICAgIHZhciBsZXZlbD0wO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7IGNvbW1lbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKSB9XHJcbiAgICBmdW5jdGlvbiBjb21tZW50KClcclxuICAgIHtcclxuICAgICAgaHRtbCs9IGxldmVsKys/ICc8Y29tbWVudCBsZXZlbD1cIicrbGV2ZWwrJ1wiPicgOiBcIjwhLS0gXCJcclxuICAgICAgY2hpbGRyZW4oYXJndW1lbnRzKVxyXG4gICAgICBodG1sKz0gLS1sZXZlbD8gJzwvY29tbWVudD4nOiAnIC0tPidcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvZmZlZVNjcmlwdCgpXHJcbiAge1xyXG4gICAgaWYoMSE9YXJndW1lbnRzLmxlbmd0aCB8fCdmdW5jdGlvbichPXR5cGVvZiBhcmd1bWVudHNbMF0pXHJcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcignVXNhZ2U6IGNvZmZlZXNjcmlwdCAtPiBjb2RlJylcclxuICAgIGh0bWwrPSc8c2NyaXB0PjwhLS1cXG4oJythcmd1bWVudHNbMF0udG9TdHJpbmcoKSsnKSgpXFxuLy8tLT5cXG48L3NjcmlwdD4nO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRob2NUYWcoKVxyXG4gIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihuYW1lLCBlbXB0eSl7IHJldHVybiB0YWcobmFtZSwgZW1wdHkpIH1cclxuICAgIGZ1bmN0aW9uIGlzRW1wdHkobmFtZSlcclxuICAgIHtcclxuICAgICAgZm9yKHZhciBpIGluIGVUYWdzKSBpZihuYW1lPT1lVGFnc1tpXSkgcmV0dXJuIHRydWVcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHRhZyhuYW1lLCBlbXB0eSlcclxuICAgIHtcclxuICAgICAgcmV0dXJuIG1ha2VUYWcobmFtZSwgbnVsbD09ZW1wdHk/IGlzRW1wdHkoU3RyaW5nKG5hbWUpLnRvTG93ZXJDYXNlKCkpIDogZW1wdHkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBub1RhZyhhdHRycylcclxuICB7XHJcbiAgICBjaGlsZHJlbignb2JqZWN0Jz09dHlwZW9mIGF0dHJzID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogYXJndW1lbnRzKVxyXG4gIH1cclxuXHJcbiAgc2NvcGUucHJpbnQ9c2NvcGUudGV4dD1mdW5jdGlvbigpe3ByaW50KGFyZ3VtZW50cyl9XHJcbiAgc2NvcGUucmF3PWZ1bmN0aW9uKCl7cmF3KGFyZ3VtZW50cyl9XHJcbiAgc2NvcGUudGFnPWFkaG9jVGFnKClcclxuICBzY29wZS5ub3RhZz1mdW5jdGlvbigpe25vVGFnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyl9XHJcbiAgc2NvcGUuY29tbWVudD1tYWtlQ29tbWVudCgpXHJcbiAgc2NvcGUuYmxhY2tob2xlPWZ1bmN0aW9uKCl7fVxyXG4gIHNjb3BlLmNvZmZlZXNjcmlwdD1mdW5jdGlvbigpeyBjb2ZmZWVTY3JpcHQuYXBwbHkodGhpcywgYXJndW1lbnRzKSB9XHJcblxyXG4gIGZvcih2YXIgaSBpbiBuVGFncykgc2NvcGVbblRhZ3NbaV1dPW1ha2VUYWcoblRhZ3NbaV0pXHJcbiAgc2NvcGUuJHZhcj1tYWtlVGFnKCd2YXInKVxyXG4gIGZvcih2YXIgaSBpbiBlVGFncykgc2NvcGVbZVRhZ3NbaV1dPW1ha2VUYWcoZVRhZ3NbaV0sIHRydWUpXHJcblxyXG4gIGZ1bmN0aW9uIG1ha2VWYXJzKClcclxuICB7XHJcbiAgICB2YXIgdj1bXTtcclxuICAgIGZvcih2YXIgdGFnIGluIHNjb3BlKSB2LnB1c2godGFnKyc9dGhpcy4nK3RhZylcclxuICAgIHJldHVybiAndmFyICcrdi5qb2luKCcsJylcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNldENvbnRleHQoZm4pe1xyXG4gICAgcmV0dXJuIChuZXcgRnVuY3Rpb24obWFrZVZhcnMoKSsnXFxucmV0dXJuICcrZm4udG9TdHJpbmcoKSkpLmNhbGwoc2NvcGUpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJhYmxlKGZuKVxyXG4gIHtcclxuICAgIGlmKCdmdW5jdGlvbichPXR5cGVvZiBmbikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbGw6IHdpdGhPdXQuY29tcGlsZShmdW5jdGlvbilcIik7XHJcbiAgICB2YXIgcGVuZGluZz10cnVlXHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKVxyXG4gICAge1xyXG4gICAgICBpZihwZW5kaW5nKVxyXG4gICAgICB7XHJcbiAgICAgICAgZm49c2V0Q29udGV4dChmbilcclxuICAgICAgICBwZW5kaW5nPWZhbHNlXHJcbiAgICAgIH1cclxuICAgICAgdHJ5XHJcbiAgICAgIHtcclxuICAgICAgICB2YXIgdGhhdD1fdGhpcywgeD1odG1sXHJcbiAgICAgICAgX3RoaXM9dGhpc1xyXG4gICAgICAgIGh0bWw9JydcclxuICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXHJcbiAgICAgICAgcmV0dXJuIGh0bWxcclxuICAgICAgfVxyXG4gICAgICBmaW5hbGx5XHJcbiAgICAgIHtcclxuICAgICAgICBfdGhpcz10aGF0XHJcbiAgICAgICAgaHRtbD14XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbXBpbGUoZm4pXHJcbiAge1xyXG4gICAgdmFyIHdpdGhPdXQ9cmVuZGVyYWJsZShmbik7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gd2l0aE91dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gJGNvbXBpbGUoZm4pXHJcbiAge1xyXG4gICAgdmFyIHdpdGhPdXQ9cmVuZGVyYWJsZShmbik7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gd2l0aE91dC5hcHBseShhcmd1bWVudHNbMF0sIGFyZ3VtZW50cyl9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmbGF0dGVuKGFycmF5KVxyXG4gIHtcclxuICAgIHZhciB2LCByPVtdXHJcbiAgICBmb3IodmFyIGkgaW4gYXJyYXkpXHJcbiAgICAgIGlmKCdvYmplY3QnPT10eXBlb2Yodj1hcnJheVtpXSkpXHJcbiAgICAgICAgci5wdXNoLmFwcGx5KHIsIGZsYXR0ZW4odikpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICByLnB1c2godilcclxuICAgIHJldHVybiByXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmZXRjaEpTVHMocGF0aHMpXHJcbiAge1xyXG4gICAgdmFyIHZcclxuICAgIGZvcih2YXIgaSBpbiBwYXRocylcclxuICAgIHtcclxuICAgICAgaWYoJ2Z1bmN0aW9uJyE9dHlwZW9mKHY9cGF0aHNbaV0pICYmXHJcbiAgICAgICAgICdmdW5jdGlvbichPXR5cGVvZih2PUpTVFt2XSkpXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSlNUWydcIitwYXRoc1tpXStcIiddIG5vdCBmb3VuZCBvciBpbmNvcnJlY3QhXCIpXHJcbiAgICAgIHBhdGhzW2ldPXJlbmRlcmFibGUodilcclxuICAgIH1cclxuICAgIHJldHVybiBwYXRoc1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gSlNUcyhwYXRoKVxyXG4gIHtcclxuICAgIHZhciBib3VuZCwgVHM9ZmxhdHRlbihzbGljZS5jYWxsKGFyZ3VtZW50cykpXHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gSlNUcy5hcHBseShhcmd1bWVudHNbMF0sIGFyZ3VtZW50cyl9XHJcbiAgICBmdW5jdGlvbiBKU1RzKClcclxuICAgIHtcclxuICAgICAgdmFyIFM9JydcclxuICAgICAgaWYoIWJvdW5kKVxyXG4gICAgICB7XHJcbiAgICAgICAgVHM9ZmV0Y2hKU1RzKFRzKVxyXG4gICAgICAgIGJvdW5kPXRydWVcclxuICAgICAgfVxyXG4gICAgICBmb3IodmFyIGkgaW4gVHMpIFMrPVRzW2ldLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcclxuICAgICAgcmV0dXJuIFNcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHZhciBpbnRlcmZhY2U9e1xyXG4gICAgY29tcGlsZTogY29tcGlsZSxcclxuICAgIHJlbmRlcmFibGU6IGNvbXBpbGUsXHJcbiAgICAkY29tcGlsZTogJGNvbXBpbGUsXHJcbiAgICBKU1RzOiBKU1RzXHJcbiAgfVxyXG4gIGlmKCd1bmRlZmluZWQnIT10eXBlb2YgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKVxyXG4gICAgbW9kdWxlLmV4cG9ydHM9aW50ZXJmYWNlXHJcbiAgZWxzZSBpZignZnVuY3Rpb24nPT10eXBlb2YgZGVmaW5lICYmIGRlZmluZS5hbWQpXHJcbiAgICBkZWZpbmUoaW50ZXJmYWNlKVxyXG4gIGVsc2VcclxuICAgIHRoaXMud2l0aE91dD1pbnRlcmZhY2VcclxufSkoKVxyXG5cclxuLy8tLVtFT0ZdLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiIsInZhciBjaGVja0hhc2gsIHByZXYsIHQsIHdpdGhPdXQ7XG5cbndpdGhPdXQgPSByZXF1aXJlKDEpO1xuXG5wcmV2ID0gbnVsbDtcblxuY2hlY2tIYXNoID0gZnVuY3Rpb24oKSB7XG4gIHZhciBoYXNoO1xuICBoYXNoID0gLyMoLiopfCQvLmV4ZWMobG9jYXRpb24uaHJlZilbMV0gfHwgJyc7XG4gIGlmIChwcmV2ID09PSBoYXNoKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHByZXYgPSBoYXNoO1xuICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hhc2gnKS5pbm5lckhUTUwgPSB0KGhhc2gpO1xufTtcblxudCA9IHdpdGhPdXQuJGNvbXBpbGUoZnVuY3Rpb24oKSB7XG4gIGIoJ0hhc2g6ICcpO1xuICByZXR1cm4gdGV4dCh0aGlzKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICBjaGVja0hhc2goKTtcbiAgaWYgKCdvbmhhc2hjaGFuZ2UnIGluIHdpbmRvdykge1xuICAgIHJldHVybiB3aW5kb3cub25oYXNoY2hhbmdlID0gY2hlY2tIYXNoO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB3aW5kb3cuc2V0SW50ZXJ2YWwoY2hlY2tIYXNoLCA1MCk7XG4gIH1cbn07XG4iLCJ2YXIgcmFuZG9tO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIENsZWFyLCBFcnJvciwgY2FsbGJhY2ssIGNibmFtZSwganMsIHRpbWVvdXQsIHVybDtcbiAgdXJsID0gb3B0aW9ucy51cmwsIGNhbGxiYWNrID0gb3B0aW9ucy5jYWxsYmFjaywgdGltZW91dCA9IG9wdGlvbnMudGltZW91dDtcbiAgY2FsbGJhY2sgfHwgKGNhbGxiYWNrID0gJ2NhbGxiYWNrJyk7XG4gIHRpbWVvdXQgfHwgKHRpbWVvdXQgPSAzMDAwKTtcbiAgd2hpbGUgKHdpbmRvd1tjYm5hbWUgPSBcIl9cIiArIChyYW5kb20oMTUpKV0pIHt9XG4gIHdpbmRvd1tjYm5hbWVdID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChDbGVhcigpKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9wdGlvbnMuc3VjY2VzcyA9PT0gXCJmdW5jdGlvblwiID8gb3B0aW9ucy5zdWNjZXNzKGRhdGEpIDogdm9pZCAwO1xuICAgIH1cbiAgfTtcbiAgRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoQ2xlYXIoKSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvcHRpb25zLmVycm9yID09PSBcImZ1bmN0aW9uXCIgPyBvcHRpb25zLmVycm9yKCkgOiB2b2lkIDA7XG4gICAgfVxuICB9O1xuICBqcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBqcy5hc3luYyA9IHRydWU7XG4gIGpzLm9uZXJyb3IgPSBFcnJvcjtcbiAganMuc3JjID0gXCJcIiArIHVybCArICh1cmwuaW5kZXhPZignPycpID49IDAgPyAnJicgOiAnPycpICsgY2FsbGJhY2sgKyBcIj1cIiArIGNibmFtZTtcbiAgKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0gfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXSkuYXBwZW5kQ2hpbGQoanMpO1xuICBzZXRUaW1lb3V0KEVycm9yLCB0aW1lb3V0KTtcbiAgQ2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWpzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRlbGV0ZSB3aW5kb3dbY2JuYW1lXTtcbiAgICBqcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGpzKTtcbiAgICBqcyA9IG51bGw7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG59O1xuXG5yYW5kb20gPSBmdW5jdGlvbihxKSB7XG4gIHZhciBuLCBzO1xuICBpZiAocSA9PSBudWxsKSB7XG4gICAgcSA9IDE7XG4gIH1cbiAgcyA9ICcnO1xuICB3aGlsZSAocy5sZW5ndGggPCBxKSB7XG4gICAgbiA9IE1hdGguZmxvb3IoNjIgKiBNYXRoLnJhbmRvbSgpKTtcbiAgICBzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUobiAlIDI2ICsgJ0FhMCcuY2hhckNvZGVBdChuIC8gMjYpKTtcbiAgfVxuICByZXR1cm4gcztcbn07XG4iLCJ2YXIgWXVzZXIsIGhpc3RvcnksIGxvYWQsIHJlbmRlciwgdCwgdSwgd2l0aE91dDtcblxud2l0aE91dCA9IHJlcXVpcmUoMyk7XG5cbll1c2VyID0gcmVxdWlyZSgxKTtcblxuaGlzdG9yeSA9IHJlcXVpcmUoMik7XG5cbnNldFRpbWVvdXQoaGlzdG9yeSk7XG5cbnUgPSBuZXcgWXVzZXIoJ3N0YW5pc2xhdi11a29sb3YnLCB7XG4gIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhLCBfaSwgX2xlbiwgX3JlZjtcbiAgICBfcmVmID0gdGhpcy55YWxidW1zO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgYSA9IF9yZWZbX2ldO1xuICAgICAgaWYgKGEuZGVmLmltZykge1xuICAgICAgICBsb2FkKGEpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb25zb2xlLmxvZygnTm8gYWxidW1zIGZvdW5kJyk7XG4gIH1cbn0pO1xuXG5sb2FkID0gZnVuY3Rpb24oYSkge1xuICByZXR1cm4gYS5sb2FkUGhvdG9zKHtcbiAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coJ09vcHMnKTtcbiAgICB9LFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlbmRlcih0aGlzKTtcbiAgICB9XG4gIH0pO1xufTtcblxucmVuZGVyID0gZnVuY3Rpb24oeWFsYnVtKSB7XG4gIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm90a3knKS5pbm5lckhUTUwgPSB0KHlhbGJ1bS55bWdzKTtcbn07XG5cbnQgPSB3aXRoT3V0LiRjb21waWxlKGZ1bmN0aW9uKGxpc3QsIHNpemUpIHtcbiAgdmFyIHksIHl6LCBfaSwgX2xlbjtcbiAgaWYgKHNpemUgPT0gbnVsbCkge1xuICAgIHNpemUgPSAnUyc7XG4gIH1cbiAgZm9yIChfaSA9IDAsIF9sZW4gPSBsaXN0Lmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgeSA9IGxpc3RbX2ldO1xuICAgIHl6ID0geS5kZWYuaW1nW3NpemVdO1xuICAgIGRpdih7XG4gICAgICBcImNsYXNzXCI6ICd0aHVtYm5haWwnXG4gICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYSh7XG4gICAgICAgIHN0eWxlOiBcIndpZHRoOiBcIiArIHl6LndpZHRoICsgXCJweDtcIixcbiAgICAgICAgaHJlZjogXCIjXCIgKyAoeS5mdWxsUGF0aCgpKSxcbiAgICAgICAgdGl0bGU6IHkuZGVmLnRpdGxlIHx8IG51bGxcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICBpbWcoe1xuICAgICAgICAgIHNyYzogeXouaHJlZlxuICAgICAgICB9KTtcbiAgICAgICAgZGl2KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBiKHkuZGVmLnRpdGxlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkaXYoe1xuICAgICAgICAgIHRpdGxlOiB5LmRlZi5zdW1tYXJ5IHx8IG51bGxcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHNtYWxsKHkuZGVmLnN1bW1hcnkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59KTtcbiIsInZhciBZYWxidW0sIFltZywganNvbnA7XG5cblltZyA9IHJlcXVpcmUoMSk7XG5cbmpzb25wID0gcmVxdWlyZSgyKTtcblxuWWFsYnVtID0gZnVuY3Rpb24oeXVzZXIsIGRlZikge1xuICB0aGlzLmRlZiA9IGRlZjtcbiAgdGhpcy5pZCA9IGRlZi5pZC5zcGxpdCgnOicpLnJldmVyc2UoKVswXTtcbiAgcmV0dXJuIHRoaXMucGF0aCA9IHl1c2VyLmlkO1xufTtcblxuWWFsYnVtLnByb3RvdHlwZSA9IHtcbiAgbG9hZFBob3RvczogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghdGhpcy52aXNpYmxlKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIGpzb25wKHtcbiAgICAgIHVybDogdGhpcy5kZWYubGlua3MucGhvdG9zLFxuICAgICAgc3VjY2VzczogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIHksIF9yZWY7XG4gICAgICAgICAgX3RoaXMueW1ncyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgICAgICBfcmVmID0gKHRoaXMucGhvdG9zID0gZGF0YSkuZW50cmllcztcbiAgICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgeSA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKG5ldyBZbWcodGhpcywgeSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICAgIH0pLmNhbGwoX3RoaXMpO1xuICAgICAgICAgIHJldHVybiAoX3JlZiA9IG9wdGlvbnMuc3VjY2VzcykgIT0gbnVsbCA/IF9yZWYuY2FsbChfdGhpcykgOiB2b2lkIDA7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSxcbiAgICAgIGVycm9yOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBfcmVmO1xuICAgICAgICAgIHJldHVybiAoX3JlZiA9IG9wdGlvbnMuZXJyb3IpICE9IG51bGwgPyBfcmVmLmNhbGwoX3RoaXMpIDogdm9pZCAwO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcylcbiAgICB9KTtcbiAgfSxcbiAgZnVsbFBhdGg6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIlwiICsgdGhpcy5wYXRoICsgXCIvXCIgKyB0aGlzLmlkO1xuICB9LFxuICB2aXNpYmxlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kZWYuaW1nICE9IG51bGw7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gWWFsYnVtO1xuIiwidmFyIFltZztcblxuWW1nID0gZnVuY3Rpb24oeWFsYnVtLCBkZWYpIHtcbiAgdGhpcy5kZWYgPSBkZWY7XG4gIHRoaXMuaWQgPSBkZWYuaWQuc3BsaXQoJzonKS5yZXZlcnNlKClbMF07XG4gIHJldHVybiB0aGlzLnBhdGggPSB5YWxidW0uZnVsbFBhdGgoKTtcbn07XG5cblltZy5wcm90b3R5cGUgPSB7XG4gIGZ1bGxQYXRoOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJcIiArIHRoaXMucGF0aCArIFwiL1wiICsgdGhpcy5pZDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBZbWc7XG4iLCJ2YXIgWWFsYnVtLCBZdXNlciwganNvbnA7XG5cbllhbGJ1bSA9IHJlcXVpcmUoMSk7XG5cbmpzb25wID0gcmVxdWlyZSgyKTtcblxuWXVzZXIgPSBmdW5jdGlvbihuYW1lLCBvcHRpb25zKSB7XG4gIHZhciBmaW5kSWQsIG1ha2VZYWxidW1zO1xuICB0aGlzLm5hbWUgPSBuYW1lO1xuICBqc29ucCh7XG4gICAgdXJsOiBcImh0dHA6Ly9hcGktZm90a2kueWFuZGV4LnJ1L2FwaS91c2Vycy9cIiArIChlc2NhcGUobmFtZSkpICsgXCIvP2Zvcm1hdD1qc29uXCIsXG4gICAgZXJyb3I6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgcmV0dXJuIChfcmVmID0gb3B0aW9ucy5lcnJvcikgIT0gbnVsbCA/IF9yZWYuY2FsbChfdGhpcykgOiB2b2lkIDA7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpLFxuICAgIHN1Y2Nlc3M6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgX3RoaXMuc2VydmljZSA9IGRhdGE7XG4gICAgICAgIHJldHVybiBqc29ucCh7XG4gICAgICAgICAgdXJsOiBkYXRhLmNvbGxlY3Rpb25zWydhbGJ1bS1saXN0J10uaHJlZiArICc/Zm9ybWF0PWpzb24nLFxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBfcmVmO1xuICAgICAgICAgICAgcmV0dXJuIChfcmVmID0gb3B0aW9ucy5lcnJvcikgIT0gbnVsbCA/IF9yZWYuY2FsbChfdGhpcykgOiB2b2lkIDA7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgICAgIF90aGlzLmFsYnVtcyA9IGRhdGE7XG4gICAgICAgICAgICBmaW5kSWQoKTtcbiAgICAgICAgICAgIF90aGlzLnlhbGJ1bXMgPSBtYWtlWWFsYnVtcygpO1xuICAgICAgICAgICAgcmV0dXJuIChfcmVmID0gb3B0aW9ucy5zdWNjZXNzKSAhPSBudWxsID8gX3JlZi5jYWxsKF90aGlzKSA6IHZvaWQgMDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKVxuICB9KTtcbiAgZmluZElkID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGEsIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgX3JlZiA9IF90aGlzLmFsYnVtcy5hdXRob3JzO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGEgPSBfcmVmW19pXTtcbiAgICAgICAgaWYgKGEubmFtZSA9PT0gX3RoaXMubmFtZSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5pZCA9IGEudWlkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfSkodGhpcyk7XG4gIHJldHVybiBtYWtlWWFsYnVtcyA9IChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVmID0gX3RoaXMuYWxidW1zLmVudHJpZXM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGEgPSBfcmVmW19pXTtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChuZXcgWWFsYnVtKF90aGlzLCBhKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfSkodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFl1c2VyO1xuIl19
