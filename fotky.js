!function t(n,r,e){function i(u,a){if(!r[u]){if(!n[u]){var f="function"==typeof require&&require;if(!a&&f)return f(u,!0);if(o)return o(u,!0);throw new Error("Cannot find module '"+u+"'")}var l=r[u]={exports:{}};n[u][0].call(l.exports,function(t){var r=n[u][1][t];return i(r?r:t)},l,l.exports,t,n,r,e)}return r[u].exports}for(var o="function"==typeof require&&require,u=0;u<e.length;u++)i(e[u]);return i}({1:[function(t,n){!function(){function t(t){return String(t).replace(/[&<>"]/g,function(t){return b[t]})}function r(n){var r,e;for(r=0;r<n.length;r++)null!=(e=n[r])&&("function"==typeof e?e.call(v):M+=t(e))}function e(n){var r,e;for(r=0;r<n.length;r++)null!=(e=n[r])&&(M+=t(e))}function i(t){var n,r;for(n=0;n<t.length;n++)null!=(r=t[n])&&(M+=r)}function o(n,e){function i(n,r){null!=r&&!1!==r&&(M+=" "+t(n),!0!==r&&(M+='="'+t(r)+'"'))}function o(t,n){for(var r in n)"object"==typeof n[r]?o(t+r+"-",n[r]):i(t+r,n[r])}function u(t){M+="<"+n;var u=t[0];if("object"==typeof u){for(var a in u)"data"==a&&"object"==typeof u[a]?o("data-",u[a]):i(a,u[a]);t=w.call(t,1)}if(M+=">",e&&t.length)throw new SyntaxError("<"+n+"> must have no content!");e||(r(t),M+="</"+n+">")}return function(){u(arguments)}}function u(){function t(){M+=n++?'<comment level="'+n+'">':"<!-- ",r(arguments),M+=--n?"</comment>":" -->"}var n=0;return function(){t.apply(this,arguments)}}function a(){if(1!=arguments.length||"function"!=typeof arguments[0])throw new SyntaxError("Usage: coffeescript -> code");M+="<script><!--\n("+arguments[0].toString()+")()\n//-->\n</script>"}function f(){function t(t){for(var n in y)if(t==y[n])return!0}function n(n,r){return o(n,null==r?t(String(n).toLowerCase()):r)}return function(t,r){return n(t,r)}}function l(t){r("object"==typeof t?w.call(arguments,1):arguments)}function c(){var t=[];for(var n in x)t.push(n+"=this."+n);return"var "+t.join(",")}function s(t,n,r){function e(){f&&o();try{var n=v,r=M;return v=this,M="",u(),t.apply(this,arguments),M}finally{v=n,M=r}}function i(){var t=n.id;return null==t&&(t=""),t=String(t).split(/\W+/).join("/").replace(/^\/+|\/+$/g,""),t.length||(t=++T),n.id=t,r&&(t+="["+r+"]"),t}function o(){var r;t=t.toString(),a=!/[\r\n]/.test(t),t=c()+"\nreturn "+t,a||(t+="\n//# sourceURL=eval://withOut/"+(r=i())+".wo"),t=new Function(t).call(x),a||(t.displayName="<"+r+">",n.displayName="{{"+r+"}}")}function u(){return a||!1===L.bp?void 0:L.bp?!0:r&&"number"==typeof n.bp?r==n.bp:n.bp}if("function"!=typeof t)throw new TypeError("Call: withOut.compile(function)");var a,f=!0;return n.id=null,e}function d(t){function n(){return r.apply(this,arguments)}var r=s(t,n);return n}function h(t){function n(t){return r.apply(t,arguments)}var r=s(t,n);return n}function p(t){var n,r=[];for(var e in t)"object"==typeof(n=t[e])?r.push.apply(r,p(n)):r.push(n);return r}function m(){function t(t){return n.apply(t,arguments)}function n(){var t="";e||r();for(var n in i)t+=i[n].apply(this,arguments);return t}function r(){var n,r=t.id;for(var o in i){if("function"!=typeof(n=i[o])&&"function"!=typeof(n=JST[n]))throw new Error("JST['"+i[o]+"'] not found or incorrect!");i[o]=s(n,t,Number(o)+1)}t.id=r,e=!0}var e,i=p(w.call(arguments));return t.id=null,t}var v,g="a abbr acronym address applet article aside audio b bdo big blockquote body button canvas caption center cite code colgroup command datalist dd del details dfn dir div dl dt em embed fieldset figcaption figure font footer form frameset h1 h2 h3 h4 h5 h6 head header hgroup html i iframe ins keygen kbd label legend li map mark menu meter nav noframes noscript object ol optgroup option output p pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr tt u ul video wbr xmp".split(" "),y="area base basefont br col frame hr img input link meta param".split(" "),b={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"},w=[].slice,x={},T=0,M="";x.print=x.text=function(){e(arguments)},x.raw=function(){i(arguments)},x.tag=f(),x.notag=function(){l.apply(this,arguments)},x.comment=u(),x.blackhole=function(){},x.coffeescript=function(){a.apply(this,arguments)};for(var H in g)x[g[H]]=o(g[H]);x.$var=o("var");for(var H in y)x[y[H]]=o(y[H],!0);var L={compile:d,renderable:d,$compile:h,JSTs:m};"undefined"!=typeof n&&n.exports?n.exports=L:"function"==typeof define&&define.amd?define(L):this.withOut=L}()},{}],2:[function(t,n){var r;r=function(t){var n,r;return r=null,n=function(){var n;return n=/#(.*)|$/.exec(location.href)[1]||"",r!==n?(r=n,"function"==typeof t?t(n):void 0):void 0},"onhashchange"in window?window.onhashchange=n:window.setInterval(n,50),n()},n.exports=r},{}],3:[function(t,n){var r,e,i,o;e=t(1),i=encodeURIComponent,r=function(t){var n,u,a,f,l,c,s,d,h,p,m,v,g;for(g=e(r.defaults,t),m=g.url,a=g.callback,p=g.timeout;window[f="_"+o(15)];);l=e(t.data),l[a]=f,h="";for(d in l)v=l[d],null!=v&&(v=String(v)).length&&(h+=""+(h.length||0<=m.indexOf("?")?"&":"?")+i(d)+"="+i(v));window[f]=function(r){return n(),"function"==typeof t.success?t.success(r):void 0},u=function(){return n(),"function"==typeof t.error?t.error():void 0},s=document.createElement("script"),s.onerror=u,s.src=m+h,(document.getElementsByTagName("head")[0]||document.getElementsByTagName("body")[0]).appendChild(s),c=setTimeout(u,p),n=function(){try{delete window[f]}catch(t){window[f]=null}return clearTimeout(c),s.onerror=null,s.parentNode.removeChild(s),s=null}},r.defaults={callback:"callback",timeout:3e3},o=function(t){var n,r;for(null==t&&(t=1),r="";r.length<t;)n=Math.floor(62*Math.random()),r+=String.fromCharCode(n%26+"Aa0".charCodeAt(n/26));return r},n.exports=r},{1:5}],4:[function(t){var n,r,e;n=t(3),r=t(1),e=t(2),r.register(n),r.ready=e},{1:7,2:8,3:12}],5:[function(t,n){var r;r=function(){var t,n,r,e,i,o;for(n={},i=0,o=arguments.length;o>i;i++)if(e=arguments[i],null!=e)for(t in e)r=e[t],n[t]=r;return n},n.exports=r},{}],6:[function(t,n){var r,e,o,u,f,l;e=t(1),l=t(2),r=function(t,n){var r,i;return r=function(){var r,e,i,o,u;for(u=n.ymgs,r=i=0,o=u.length;o>i;r=++i)if(e=u[r],e.id===t)return e.idx=Number(r),e},n.failed||!(i=r())?void(location.hash="#"+n.fullPath()):(document.title=i.def.title,e.head.innerHTML=f(i,n),e.body.innerHTML="",e.foot.innerHTML=u(i.def.summary),e.body.innerHTML=o(i,e.size()))},o=l.$compile(function(t,n){var r,e,i,o,u,a;n.w<1&&(n.w=1),n.h<1&&(n.h=1),o=null,a=t.def.img;for(i in a)u=a[i],e=Math.abs(Math.log(u.width*n.h>u.height*n.w?u.width/n.w:u.height/n.h)),(!o||r>e)&&(o=u,r=e);return img({src:o.href,alt:t.def.title,title:t.def.title,style:"max-height: "+n.h+"px; max-width: "+n.w+"px;"})}),o.id="img",f=l.$compile(function(t,n){return a({"class":"left",href:"#"+(n.ymgs[t.idx-1]||n).fullPath(),title:"Назад"},"<<"),a({href:"#"},"Галереи"),text(" / "),a({href:"#"+n.fullPath()},n.def.title),text(" / "),b(t.def.title),a({"class":"right",href:"#"+(n.ymgs[t.idx+1]||n).fullPath(),title:"Вперёд"},">>")}),f.id="iHead",u=l.$compile(function(t){return i(t)}),u.id="iFoot",n.exports=r},{1:7,2:1}],7:[function(t,n,r){var e,i,o,u,a,f,l,c,s,d,h,p;c=t(1),p=t(2),l=[],e={},i=null,setTimeout(function(){var t;if((i=document.getElementById("fotky"))&&(t=i.getElementsByTagName("script")[0]))return f(s(t.innerHTML))}),o=function(t){var n,r,e;n=[];for(e in t)r=t[e],"object"==typeof r?n.push.apply(n,o(r)):n.push(r);return n},r.register=function(){var t,n,r,i,u,a,f,c,s;for(c=l=o([].slice.call(arguments)),t=i=0,a=c.length;a>i;t=++i)for(r=c[t],s=r.exts||[],u=0,f=s.length;f>u;u++)n=s[u],e[n]=t},s=function(t){var n,r,i,o,u;for(r=/[*]|(?:([-\w]+)(?:@([-\w]+(?:[.][-\w]+)?))?)/g,u=[];n=r.exec(t);)n[2]?(o={u:n[1],d:e[n[2]]},null==o.d&&(o=null),i=0):o&&("*"===n[0]&&i++||u.push(c({id:n[0]},o,1&i&&"*"!==n[0]?{off:1}:{})));return u},u=function(t,n){var r,e,i,o,u,f,c,s;for(i={},f=0,c=t.length;c>f;f++)o=t[f],i[s=o.uid=""+o.u+"@"+o.d]||(i[s]=o);return e=function(){var t;t=[];for(u in i)o=i[u],t.push(o);return t}(),i={},(r=function(){return(o=e.pop())?new l[o.d](o.u,{error:r,success:function(){return a(i[o.uid]=this),r()}}):"function"==typeof n?n(i):void 0})()},a=function(t){var n,r,e,i,o;if(!t._){for(t._={},i=t.yalbums,o=[],r=0,e=i.length;e>r;r++)n=i[r],n.visible()&&o.push(t._[n.id]=n);return o}},d=function(){var t,n,e,o;for(i.innerHTML=p.compile(function(){var t,n,r,e;for(e="head body foot".split(" "),n=0,r=e.length;r>n;n++)t=e[n],div({id:t})})(),o=i.childNodes,n=0,e=o.length;e>n;n++)t=o[n],r[t.id]=t},f=function(t){return u(t,function(n){var e,i,o,u,a,f,l,c,s;for(u=[],e=function(t){return null==t.idx?t.idx=-1+u.push(t):void 0},i=function(t){var n,r,i,o;i=t._,o=[];for(n in i)r=i[n],o.push(e(r));return o},o=function(t){var n,r,e,i;if(null!=t.idx){for(u.splice(t.idx,1),n=e=0,i=u.length;i>e;n=++e)r=u[n],r.idx=n;return delete t.idx}},c=0,s=t.length;s>c;c++)l=t[c],(a=n[l.uid])&&("*"!==l.id?(f=a._[l.id])&&(l.off?o(f):e(f)):i(a));return d(),"function"==typeof r.ready?r.ready(u):void 0})},h=function(){return{w:i.offsetWidth,h:document.body.clientHeight-r.head.offsetHeight-r.foot.offsetHeight}},r.size=h},{1:5,2:1}],8:[function(t,n){var r,e,o,u,f,l,c,s,d,h;r=t(1),o=t(2),d=t(3),e=t(4),h=t(5),u=function(t){var n,i,u,a,h;for(i=document.title,n={},a=0,h=t.length;h>a;a++)u=t[a],n[u.fullPath()]=u;return r(function(r){var u,a,h;return""===r?(document.title=i,o.head.innerHTML="",o.foot.innerHTML="",void d(t)):(r=r.split(/\/+/),(u=n[r.slice(0,2).join("/")])?(document.title=u.def.title,o.head.innerHTML=l(u),o.foot.innerHTML=f(u.def.summary),h=r.slice(2).join("/"),a=function(t){return u.loaded=!0,t&&(u.failed=!0),h?e(h,u):u.failed?o.body.innerHTML=c:d(u.ymgs)},u.loaded?a():(o.body.innerHTML=s(),u.loadPhotos({success:a,error:function(){return a(1)}}))):void(location.hash="#"))})},l=h.$compile(function(t){return a({href:"#"},"Галереи"),text(" / "),b(t.def.title)}),l.id="aHead",f=h.$compile(function(t){return i(t)}),f.id="aFoot",s=h.compile(function(){return div({"class":"info"},"Идёт загрузка альбома...")}),s.id="wait",c=h.compile(function(){return div({"class":"error"},"Не удалось загрузить альбом :-(")})(),n.exports=u},{1:2,2:7,3:9,4:6,5:1}],9:[function(t,n){var r,e,i,o;r=t(1),o=t(2),i=function(t){var n;return n=r.size(),r.body.innerHTML=e(t,n.w/Math.max(3,Math.sqrt(t.length)))},e=o.$compile(function(t,n){var r,e,i,o,u,f,l,c,s;for(l=0,c=t.length;c>l;l++){f=t[l],e=0,s=f.def.img;for(r in s)i=s[r],u=Math.max(i.width,i.height),(!e||u>o&&n>=u||o>u&&u>=n||n>=u&&o>n)&&(e=i,o=u);span({"class":"thumbnail"},function(){return a({style:"width: "+e.width+"px;",href:"#"+f.fullPath(),title:f.def.title||null},function(){return img({src:e.href,alt:f.def.title}),div(function(){return b(f.def.title)}),div({title:f.def.summary||null},function(){return small(f.def.summary)})})})}}),e.id="thumbs",n.exports=i},{1:7,2:1}],10:[function(t,n){var r,e,i;e=t(1),i=t(2),r=function(t,n){return this.def=n,this.id=n.id.split(":").reverse()[0],this.path=t.id},r.prototype={loadPhotos:function(t){return this.visible()?i({url:this.def.links.photos,success:function(n){return function(r){var i,o;return n.ymgs=function(){var t,n,o,u;for(o=(this.photos=r).entries,u=[],t=0,n=o.length;n>t;t++)i=o[t],u.push(new e(this,i));return u}.call(n),null!=(o=t.success)?o.call(n):void 0}}(this),error:function(n){return function(){var r;return null!=(r=t.error)?r.call(n):void 0}}(this)}):void 0},fullPath:function(){return""+this.path+"/"+this.id},visible:function(){return null!=this.def.img}},n.exports=r},{1:11,2:3}],11:[function(t,n){var r;r=function(t,n){return this.def=n,this.id=n.id.split(":").reverse()[0],this.path=t.fullPath()},r.prototype={fullPath:function(){return""+this.path+"/"+this.id}},n.exports=r},{}],12:[function(t,n){var r,e,i;r=t(1),i=t(2),e=function(t,n){var e,o;return this.name=t,i({url:"http://api-fotki.yandex.ru/api/users/"+escape(t)+"/",data:{format:"json"},error:function(t){return function(){var r;return null!=(r=n.error)?r.call(t):void 0}}(this),success:function(t){return function(r){return t.service=r,i({url:r.collections["album-list"].href+"?format=json",error:function(){var r;return null!=(r=n.error)?r.call(t):void 0},success:function(r){var i;return t.albums=r,e(),t.yalbums=o(),null!=(i=n.success)?i.call(t):void 0}})}}(this)}),e=function(t){return function(){var n,r,e,i;for(i=t.albums.authors,r=0,e=i.length;e>r;r++)if(n=i[r],n.name===t.name)return t.id=n.uid}}(this),o=function(t){return function(){var n,e,i,o,u;for(o=t.albums.entries,u=[],e=0,i=o.length;i>e;e++)n=o[e],u.push(new r(t,n));return u}}(this)},e.exts="y yandex ya.ru yandex.ru".split(" "),n.exports=e},{1:10,2:3}]},{},[4]);