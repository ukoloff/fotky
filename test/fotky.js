(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
var Yuser, u;

Yuser = require(1);

u = new Yuser('stanislav-ukolov', {
  success: function() {
    return console.log(this);
  }
});

},{"1":5}],3:[function(require,module,exports){
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

},{"1":4,"2":1}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"1":3,"2":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVGVtcFxcZ2l0XFxmb3RreVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVGVtcC9naXQvZm90a3kvc3JjL2pzb25wLmNvZmZlZSIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy9tYWluLmNvZmZlZSIsIkM6L1RlbXAvZ2l0L2ZvdGt5L3NyYy95YWxidW0uY29mZmVlIiwiQzovVGVtcC9naXQvZm90a3kvc3JjL3ltZy5jb2ZmZWUiLCJDOi9UZW1wL2dpdC9mb3RreS9zcmMveXVzZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcmFuZG9tO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIENsZWFyLCBFcnJvciwgY2FsbGJhY2ssIGNibmFtZSwganMsIHRpbWVvdXQsIHVybDtcbiAgdXJsID0gb3B0aW9ucy51cmwsIGNhbGxiYWNrID0gb3B0aW9ucy5jYWxsYmFjaywgdGltZW91dCA9IG9wdGlvbnMudGltZW91dDtcbiAgY2FsbGJhY2sgfHwgKGNhbGxiYWNrID0gJ2NhbGxiYWNrJyk7XG4gIHRpbWVvdXQgfHwgKHRpbWVvdXQgPSAzMDAwKTtcbiAgd2hpbGUgKHdpbmRvd1tjYm5hbWUgPSBcIl9cIiArIChyYW5kb20oMTUpKV0pIHt9XG4gIHdpbmRvd1tjYm5hbWVdID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChDbGVhcigpKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9wdGlvbnMuc3VjY2VzcyA9PT0gXCJmdW5jdGlvblwiID8gb3B0aW9ucy5zdWNjZXNzKGRhdGEpIDogdm9pZCAwO1xuICAgIH1cbiAgfTtcbiAgRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoQ2xlYXIoKSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvcHRpb25zLmVycm9yID09PSBcImZ1bmN0aW9uXCIgPyBvcHRpb25zLmVycm9yKCkgOiB2b2lkIDA7XG4gICAgfVxuICB9O1xuICBqcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBqcy5hc3luYyA9IHRydWU7XG4gIGpzLm9uZXJyb3IgPSBFcnJvcjtcbiAganMuc3JjID0gXCJcIiArIHVybCArICh1cmwuaW5kZXhPZignPycpID49IDAgPyAnJicgOiAnPycpICsgY2FsbGJhY2sgKyBcIj1cIiArIGNibmFtZTtcbiAgKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0gfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXSkuYXBwZW5kQ2hpbGQoanMpO1xuICBzZXRUaW1lb3V0KEVycm9yLCB0aW1lb3V0KTtcbiAgQ2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWpzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRlbGV0ZSB3aW5kb3dbY2JuYW1lXTtcbiAgICBqcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGpzKTtcbiAgICBqcyA9IG51bGw7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG59O1xuXG5yYW5kb20gPSBmdW5jdGlvbihxKSB7XG4gIHZhciBuLCBzO1xuICBpZiAocSA9PSBudWxsKSB7XG4gICAgcSA9IDE7XG4gIH1cbiAgcyA9ICcnO1xuICB3aGlsZSAocy5sZW5ndGggPCBxKSB7XG4gICAgbiA9IE1hdGguZmxvb3IoNjIgKiBNYXRoLnJhbmRvbSgpKTtcbiAgICBzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUobiAlIDI2ICsgJ0FhMCcuY2hhckNvZGVBdChuIC8gMjYpKTtcbiAgfVxuICByZXR1cm4gcztcbn07XG4iLCJ2YXIgWXVzZXIsIHU7XG5cbll1c2VyID0gcmVxdWlyZSgxKTtcblxudSA9IG5ldyBZdXNlcignc3RhbmlzbGF2LXVrb2xvdicsIHtcbiAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKHRoaXMpO1xuICB9XG59KTtcbiIsInZhciBZYWxidW0sIFltZywganNvbnA7XG5cblltZyA9IHJlcXVpcmUoMSk7XG5cbmpzb25wID0gcmVxdWlyZSgyKTtcblxuWWFsYnVtID0gZnVuY3Rpb24oeXVzZXIsIGRlZikge1xuICB0aGlzLmRlZiA9IGRlZjtcbiAgdGhpcy5pZCA9IGRlZi5pZC5zcGxpdCgnOicpLnJldmVyc2UoKVswXTtcbiAgcmV0dXJuIHRoaXMucGF0aCA9IHl1c2VyLmlkO1xufTtcblxuWWFsYnVtLnByb3RvdHlwZSA9IHtcbiAgbG9hZFBob3RvczogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghdGhpcy52aXNpYmxlKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIGpzb25wKHtcbiAgICAgIHVybDogdGhpcy5kZWYubGlua3MucGhvdG9zLFxuICAgICAgc3VjY2VzczogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIHksIF9yZWY7XG4gICAgICAgICAgX3RoaXMueW1ncyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgICAgICBfcmVmID0gKHRoaXMucGhvdG9zID0gZGF0YSkuZW50cmllcztcbiAgICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgeSA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKG5ldyBZbWcodGhpcywgeSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICAgIH0pLmNhbGwoX3RoaXMpO1xuICAgICAgICAgIHJldHVybiAoX3JlZiA9IG9wdGlvbnMuc3VjY2VzcykgIT0gbnVsbCA/IF9yZWYuY2FsbChfdGhpcykgOiB2b2lkIDA7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSxcbiAgICAgIGVycm9yOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBfcmVmO1xuICAgICAgICAgIHJldHVybiAoX3JlZiA9IG9wdGlvbnMuZXJyb3IpICE9IG51bGwgPyBfcmVmLmNhbGwoX3RoaXMpIDogdm9pZCAwO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcylcbiAgICB9KTtcbiAgfSxcbiAgZnVsbFBhdGg6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIlwiICsgdGhpcy5wYXRoICsgXCIvXCIgKyB0aGlzLmlkO1xuICB9LFxuICB2aXNpYmxlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kZWYuaW1nICE9IG51bGw7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gWWFsYnVtO1xuIiwidmFyIFltZztcblxuWW1nID0gZnVuY3Rpb24oeWFsYnVtLCBkZWYpIHtcbiAgdGhpcy5kZWYgPSBkZWY7XG4gIHRoaXMuaWQgPSBkZWYuaWQuc3BsaXQoJzonKS5yZXZlcnNlKClbMF07XG4gIHJldHVybiB0aGlzLnBhdGggPSB5YWxidW0uZnVsbFBhdGgoKTtcbn07XG5cblltZy5wcm90b3R5cGUgPSB7XG4gIGZ1bGxQYXRoOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJcIiArIHRoaXMucGF0aCArIFwiL1wiICsgdGhpcy5pZDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBZbWc7XG4iLCJ2YXIgWWFsYnVtLCBZdXNlciwganNvbnA7XG5cbllhbGJ1bSA9IHJlcXVpcmUoMSk7XG5cbmpzb25wID0gcmVxdWlyZSgyKTtcblxuWXVzZXIgPSBmdW5jdGlvbihuYW1lLCBvcHRpb25zKSB7XG4gIHZhciBmaW5kSWQsIG1ha2VZYWxidW1zO1xuICB0aGlzLm5hbWUgPSBuYW1lO1xuICBqc29ucCh7XG4gICAgdXJsOiBcImh0dHA6Ly9hcGktZm90a2kueWFuZGV4LnJ1L2FwaS91c2Vycy9cIiArIChlc2NhcGUobmFtZSkpICsgXCIvP2Zvcm1hdD1qc29uXCIsXG4gICAgZXJyb3I6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgcmV0dXJuIChfcmVmID0gb3B0aW9ucy5lcnJvcikgIT0gbnVsbCA/IF9yZWYuY2FsbChfdGhpcykgOiB2b2lkIDA7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpLFxuICAgIHN1Y2Nlc3M6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgX3RoaXMuc2VydmljZSA9IGRhdGE7XG4gICAgICAgIHJldHVybiBqc29ucCh7XG4gICAgICAgICAgdXJsOiBkYXRhLmNvbGxlY3Rpb25zWydhbGJ1bS1saXN0J10uaHJlZiArICc/Zm9ybWF0PWpzb24nLFxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBfcmVmO1xuICAgICAgICAgICAgcmV0dXJuIChfcmVmID0gb3B0aW9ucy5lcnJvcikgIT0gbnVsbCA/IF9yZWYuY2FsbChfdGhpcykgOiB2b2lkIDA7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgICAgIF90aGlzLmFsYnVtcyA9IGRhdGE7XG4gICAgICAgICAgICBmaW5kSWQoKTtcbiAgICAgICAgICAgIF90aGlzLnlhbGJ1bXMgPSBtYWtlWWFsYnVtcygpO1xuICAgICAgICAgICAgcmV0dXJuIChfcmVmID0gb3B0aW9ucy5zdWNjZXNzKSAhPSBudWxsID8gX3JlZi5jYWxsKF90aGlzKSA6IHZvaWQgMDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKVxuICB9KTtcbiAgZmluZElkID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGEsIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgX3JlZiA9IF90aGlzLmFsYnVtcy5hdXRob3JzO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGEgPSBfcmVmW19pXTtcbiAgICAgICAgaWYgKGEubmFtZSA9PT0gX3RoaXMubmFtZSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5pZCA9IGEudWlkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfSkodGhpcyk7XG4gIHJldHVybiBtYWtlWWFsYnVtcyA9IChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVmID0gX3RoaXMuYWxidW1zLmVudHJpZXM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGEgPSBfcmVmW19pXTtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChuZXcgWWFsYnVtKF90aGlzLCBhKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfSkodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFl1c2VyO1xuIl19
