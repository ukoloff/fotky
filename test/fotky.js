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
    names=0,
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

  function renderable(fn, wrapper, n)
  {
    if('function'!=typeof fn)
      throw new TypeError("Call: withOut.compile(function)")
    var pending=true, minified
    wrapper.id=null
    return render

    function render()
    {
      if(pending) build()
      try
      {
        var that=_this, x=html
        _this=this
        html=''
        if(bp())
          debugger // Hit `Step Into` (F11) twice
        fn.apply(this, arguments)
        return html
      }
      finally
      {
        _this=that
        html=x
      }
    }

    function getName()
    {
      var name = wrapper.id
      if(null==name) name=''
      name=String(name).split(/\W+/).join('/').replace(/^\/+|\/+$/g, '')
      if(!name.length)name=++names
      wrapper.id=name
      if(n)
        name+='['+n+']'
      return name
    }

    function build()
    {
      var name
      fn=fn.toString()
      minified = !/[\r\n]/.test(fn)
      fn=makeVars()+'\nreturn '+fn
      if(!minified)
        fn+='\n//# sourceURL=eval://withOut/'+(name=getName())+'.wo'
      fn=(new Function(fn)).call(scope)
      if(!minified)
      {
        fn.displayName='<'+name+'>'
        wrapper.displayName='{{'+name+'}}'
      }
    }

    function bp()
    {
      if(minified || false===lib.bp) return
      if(lib.bp) return true
      if(n && 'number'==typeof wrapper.bp)
        return n==wrapper.bp
      return wrapper.bp
    }
  }

  function compile(fn)
  {
    var withOut=renderable(fn, wrapper)
    return wrapper

    function wrapper(){return withOut.apply(this, arguments)}
  }

  function $compile(fn)
  {
    var withOut=renderable(fn, wrapper)
    return wrapper

    function wrapper(that){return withOut.apply(that, arguments)}
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

  function JSTs(path)
  {
    var bound, Ts=flatten(slice.call(arguments))
    wrapper.id=null
    return wrapper

    function wrapper(that){return JSTs.apply(that, arguments)}

    function JSTs()
    {
      var S=''
      if(!bound) fetchJSTs()
      for(var i in Ts) S+=Ts[i].apply(this, arguments)
      return S
    }

    function fetchJSTs()
    {
      var v, id=wrapper.id
      for(var i in Ts)
      {
        if('function'!=typeof(v=Ts[i]) &&
           'function'!=typeof(v=JST[v]))
          throw new Error("JST['"+Ts[i]+"'] not found or incorrect!")
        Ts[i]=renderable(v, wrapper, Number(i)+1)
      }
      wrapper.id=id
      bound=true
    }
  }

  var lib={
    compile: compile,
    renderable: compile,
    $compile: $compile,
    JSTs: JSTs
  }
  if('undefined'!=typeof module && module.exports)
    module.exports=lib
  else if('function'==typeof define && define.amd)
    define(lib)
  else
    this.withOut=lib
})()

//--[EOF]------------------------------------------------------------

},{}],2:[function(require,module,exports){
var startHistory;

startHistory = function(fn) {
  var checkHash, prev;
  prev = null;
  checkHash = function() {
    var hash;
    hash = /#(.*)|$/.exec(location.href)[1] || '';
    if (prev === hash) {
      return;
    }
    prev = hash;
    return typeof fn === "function" ? fn(hash) : void 0;
  };
  if ('onhashchange' in window) {
    window.onhashchange = checkHash;
  } else {
    window.setInterval(checkHash, 50);
  }
  return checkHash();
};

module.exports = startHistory;

},{}],3:[function(require,module,exports){
var jsonp, merge, quote, random;

merge = require(1);

quote = encodeURIComponent;

jsonp = function(options) {
  var Clear, Error, callback, cbname, data, h, js, k, q, timeout, url, v, _ref;
  _ref = merge(jsonp.defaults, options), url = _ref.url, callback = _ref.callback, timeout = _ref.timeout;
  while (window[cbname = "_" + (random(15))]) {}
  data = merge(options.data);
  data[callback] = cbname;
  q = '';
  for (k in data) {
    v = data[k];
    if ((v != null) && (v = String(v)).length) {
      q += "" + (q.length || 0 <= url.indexOf('?') ? '&' : '?') + (quote(k)) + "=" + (quote(v));
    }
  }
  window[cbname] = function(data) {
    Clear();
    return typeof options.success === "function" ? options.success(data) : void 0;
  };
  Error = function() {
    Clear();
    return typeof options.error === "function" ? options.error() : void 0;
  };
  js = document.createElement('script');
  js.onerror = Error;
  js.src = url + q;
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(js);
  h = setTimeout(Error, timeout);
  Clear = function() {
    try {
      delete window[cbname];
    } catch (_error) {
      window[cbname] = null;
    }
    clearTimeout(h);
    js.onerror = null;
    js.parentNode.removeChild(js);
    return js = null;
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
var Yuser, root, route;

Yuser = require(1);

root = require(3);

route = require(2);

root.register(Yuser);

root.ready = route;

},{"1":12,"2":8,"3":7}],5:[function(require,module,exports){
var merge;

merge = function() {
  var k, r, v, x, _i, _len;
  r = {};
  for (_i = 0, _len = arguments.length; _i < _len; _i++) {
    x = arguments[_i];
    if (x != null) {
      for (k in x) {
        v = x[k];
        r[k] = v;
      }
    }
  }
  return r;
};

module.exports = merge;

},{}],6:[function(require,module,exports){
var picture, root, t, tF, tH, withOut;

root = require(1);

withOut = require(2);

picture = function(img, album) {
  var find, z;
  find = function() {
    var i, z, _i, _len, _ref;
    _ref = album.ymgs;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      z = _ref[i];
      if (!(z.id === img)) {
        continue;
      }
      z.idx = Number(i);
      return z;
    }
  };
  if (album.failed || !(z = find())) {
    location.hash = '#' + album.fullPath();
    return;
  }
  document.title = z.def.title;
  root.head.innerHTML = tH(z, album);
  root.body.innerHTML = t(z);
  return root.foot.innerHTML = tF(z.def.summary);
};

t = withOut.$compile(function(z) {
  return img({
    src: z.def.img.L.href
  });
});

t.id = 'img';

tH = withOut.$compile(function(img, album) {
  a({
    "class": 'left',
    href: '#' + (album.ymgs[img.idx - 1] || album).fullPath(),
    title: 'Назад'
  }, '<<');
  a({
    href: '#'
  }, 'Галереи');
  text(' / ');
  a({
    href: '#' + album.fullPath()
  }, album.def.title);
  text(' / ');
  b(img.def.title);
  return a({
    "class": 'right',
    href: '#' + (album.ymgs[img.idx + 1] || album).fullPath(),
    title: 'Вперёд'
  }, '>>');
});

tH.id = 'iHead';

tF = withOut.$compile(function(txt) {
  return i(txt);
});

tF.id = 'iFoot';

module.exports = picture;

},{"1":7,"2":1}],7:[function(require,module,exports){
var domains, flatten, getUsers, indexUser, layout, load, loaders, merge, parse, withOut;

merge = require(1);

withOut = require(2);

loaders = [];

domains = {};

setTimeout(function() {
  var script, z;
  if (!(exports.div = z = document.getElementById('fotky'))) {
    return;
  }
  if (!(script = z.getElementsByTagName('script')[0])) {
    return;
  }
  return load(parse(script.innerHTML));
});

flatten = function(array) {
  var r, x, _;
  r = [];
  for (_ in array) {
    x = array[_];
    if ('object' === typeof x) {
      r.push.apply(r, flatten(x));
    } else {
      r.push(x);
    }
  }
  return r;
};

exports.register = function() {
  var i, x, z, _i, _j, _len, _len1, _ref, _ref1;
  _ref = loaders = flatten([].slice.call(arguments));
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    z = _ref[i];
    _ref1 = z.exts || [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      x = _ref1[_j];
      domains[x] = i;
    }
  }
};

parse = function(ids) {
  var m, re, stars, user, _results;
  re = /[*]|(?:([-\w]+)(?:@([-\w]+(?:[.][-\w]+)?))?)/g;
  _results = [];
  while (m = re.exec(ids)) {
    if (m[2]) {
      user = {
        u: m[1],
        d: domains[m[2]]
      };
      if (user.d == null) {
        user = null;
      }
      stars = 0;
      continue;
    }
    if (!user) {
      continue;
    }
    if ('*' === m[0]) {
      if (stars++) {
        continue;
      }
    }
    _results.push(merge({
      id: m[0]
    }, user, stars & 1 && '*' !== m[0] ? {
      off: 1
    } : {}));
  }
  return _results;
};

getUsers = function(ids, fn) {
  var getUser, list, users, z, _, _i, _len, _name;
  users = {};
  for (_i = 0, _len = ids.length; _i < _len; _i++) {
    z = ids[_i];
    users[_name = z.uid = "" + z.u + "@" + z.d] || (users[_name] = z);
  }
  list = (function() {
    var _results;
    _results = [];
    for (_ in users) {
      z = users[_];
      _results.push(z);
    }
    return _results;
  })();
  users = {};
  return (getUser = function() {
    if (!(z = list.pop())) {
      return typeof fn === "function" ? fn(users) : void 0;
    }
    return new loaders[z.d](z.u, {
      error: getUser,
      success: function() {
        indexUser(users[z.uid] = this);
        return getUser();
      }
    });
  })();
};

indexUser = function(u) {
  var z, _i, _len, _ref, _results;
  if (u._) {
    return;
  }
  u._ = {};
  _ref = u.yalbums;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    z = _ref[_i];
    if (z.visible()) {
      _results.push(u._[z.id] = z);
    }
  }
  return _results;
};

layout = function() {
  var i, x, z, _i, _len, _ref;
  (z = exports.div).innerHTML = withOut.compile(function() {
    var i, _i;
    for (i = _i = 1; _i <= 3; i = ++_i) {
      div();
    }
  })();
  _ref = 'head body foot'.split(' ');
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    x = _ref[i];
    exports[x] = z.childNodes[i];
  }
};

load = function(ids) {
  return getUsers(ids, function(users) {
    var addAlbum, addAll, delAlbum, list, u, x, z, _i, _len;
    list = [];
    addAlbum = function(a) {
      if (a.idx != null) {
        return;
      }
      return a.idx = -1 + list.push(a);
    };
    addAll = function(u) {
      var k, v, _ref, _results;
      _ref = u._;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        _results.push(addAlbum(v));
      }
      return _results;
    };
    delAlbum = function(a) {
      if (a.idx == null) {
        return;
      }
      list.splice(a.idx, 1);
      return delete a.idx;
    };
    for (_i = 0, _len = ids.length; _i < _len; _i++) {
      z = ids[_i];
      if (!(u = users[z.uid])) {
        continue;
      }
      if ('*' === z.id) {
        addAll(u);
        continue;
      }
      if (!(x = u._[z.id])) {
        continue;
      }
      if (z.off) {
        delAlbum(x);
      } else {
        addAlbum(x);
      }
    }
    layout();
    return typeof exports.ready === "function" ? exports.ready(list) : void 0;
  });
};

},{"1":5,"2":1}],8:[function(require,module,exports){
var history, picture, root, routing, t, tF, tH, tOops, tWait, withOut;

history = require(1);

root = require(2);

t = require(3);

picture = require(4);

withOut = require(5);

routing = function(albums) {
  var all, title, z, _i, _len;
  title = document.title;
  all = {};
  for (_i = 0, _len = albums.length; _i < _len; _i++) {
    z = albums[_i];
    all[z.fullPath()] = z;
  }
  return history(function(hash) {
    var a, fire, img;
    if ('' === hash) {
      document.title = title;
      root.body.innerHTML = t(albums);
      root.head.innerHTML = '';
      root.foot.innerHTML = '';
      return;
    }
    hash = hash.split(/\/+/);
    if (!(a = all[hash.slice(0, 2).join('/')])) {
      location.hash = '#';
      return;
    }
    document.title = a.def.title;
    root.head.innerHTML = tH(a);
    root.foot.innerHTML = tF(a.def.summary);
    img = hash.slice(2).join('/');
    fire = function(oops) {
      a.loaded = true;
      if (oops) {
        a.failed = true;
      }
      if (img) {
        return picture(img, a);
      } else {
        return root.body.innerHTML = a.failed ? tOops : t(a.ymgs);
      }
    };
    if (a.loaded) {
      return fire();
    } else {
      root.body.innerHTML = tWait();
      return a.loadPhotos({
        success: fire,
        error: function() {
          return fire(1);
        }
      });
    }
  });
};

tH = withOut.$compile(function(album) {
  a({
    href: '#'
  }, 'Галереи');
  text(' / ');
  return b(album.def.title);
});

tH.id = 'aHead';

tF = withOut.$compile(function(txt) {
  return i(txt);
});

tF.id = 'aFoot';

tWait = withOut.compile(function() {
  return div({
    "class": 'info'
  }, 'Идёт загрузка альбома...');
});

tWait.id = 'wait';

tOops = withOut.compile(function() {
  return div({
    "class": 'error'
  }, 'Не удалось загрузить альбом :-(');
})();

module.exports = routing;

},{"1":2,"2":7,"3":9,"4":6,"5":1}],9:[function(require,module,exports){
var t, withOut;

withOut = require(1);

t = withOut.$compile(function(list, size) {
  var y, yz, _i, _len;
  if (size == null) {
    size = 'S';
  }
  for (_i = 0, _len = list.length; _i < _len; _i++) {
    y = list[_i];
    yz = y.def.img[size];
    span({
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

t.id = 'thumbs';

module.exports = t;

},{"1":1}],10:[function(require,module,exports){
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

},{"1":11,"2":3}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
var Yalbum, Yuser, jsonp;

Yalbum = require(1);

jsonp = require(2);

Yuser = function(name, options) {
  var findId, makeYalbums;
  this.name = name;
  jsonp({
    url: "http://api-fotki.yandex.ru/api/users/" + (escape(name)) + "/",
    data: {
      format: 'json'
    },
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

Yuser.exts = 'y yandex ya.ru yandex.ru'.split(' ');

module.exports = Yuser;

},{"1":10,"2":3}]},{},[4])


//# sourceMappingURL=fotky.map